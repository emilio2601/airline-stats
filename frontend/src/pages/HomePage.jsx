import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

import { aircraftCodes } from '../data/aircraft_codes';
import { airlineCodes } from '../data/airline_codes';
import useLocalStorage from '../hooks/useLocalStorage';
import { formatNumber } from '../utils/numberFormat';
import PagingButton from '../components/PagingButton';
import TableHeader from '../components/TableHeader';
import AirportFilter from '../components/filters/AirportFilter';
import CountryFilter from '../components/filters/CountryFilter';
import DateFilter from '../components/filters/DateFilter';
import AirlineFilter from '../components/filters/AirlineFilter';
import AircraftFilter from '../components/filters/AircraftFilter';
import ClassFilter from '../components/filters/ClassFilter';
import BaseFilter from '../components/BaseFilter';
import GroupingTab from '../components/GroupingTab';
import ColumnsTab from '../components/ColumnsTab';
import FormattingTab from '../components/FormattingTab';
import Actions from '../components/Actions';
import '../dashboard.css';

const quarterMap = { '01': 'Q1', '04': 'Q2', '07': 'Q3', '10': 'Q4' };
const groupLabels = {
  carrier: 'Airline',
  aircraft_type: 'Aircraft',
  origin: 'Origin',
  dest: 'Destination',
  origin_country: 'Origin country',
  dest_country: 'Destination country',
  month: 'Month',
  quarter: 'Quarter',
  year: 'Year',
};
const columnKeys = ['departures_performed', 'seats', 'asms', 'passengers', 'rpms', 'load_factor'];
const defaultFilters = {
  page: 1,
  items_per_page: 20,
  order_by: 'seats',
  order_dir: 'desc',
  group_by: ['carrier'],
  origin_country: 'US',
  dest_country: 'GB',
  from_date: '2023-01-01',
};

export default function HomePage({ initialFilters, savedSearch }) {
  const [data, setData] = useState({});
  const [dateRange, setDateRange] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [filters, setFilters] = useState(() => initialFilters || defaultFilters);
  const [isSavedSearchView, setIsSavedSearchView] = useState(Boolean(savedSearch));
  const [viewPanel, setViewPanel] = useState(null);
  const viewHeaderRef = useRef(null);
  const [visibleColumns, setVisibleColumns] = useLocalStorage(
    'visibleColumns',
    columnKeys.reduce((result, key) => ({ ...result, [key]: true }), {})
  );
  const [formattingOptions, setFormattingOptions] = useLocalStorage('formattingOptions', {
    showPerFlightAverage: true,
    rounding: 'none',
    significantDigits: 3,
    decimalPrecision: 0,
    aircraftIcaoOnly: false,
    airlineIataOnly: false,
    aircraftLabelFormat: 'name_icao',
    airlineLabelFormat: 'name_only',
  });

  const handleFilterChange = (newFilters) => {
    if (isSavedSearchView) setIsSavedSearchView(false);
    setFilters((current) => {
      const resolved = typeof newFilters === 'function' ? newFilters(current) : newFilters;
      const corrected = { ...resolved };
      if (groupLabels[corrected.order_by] && !corrected.group_by?.includes(corrected.order_by)) {
        corrected.order_by = 'seats';
        corrected.order_dir = 'desc';
      }
      const changedFilter = Object.keys({ ...current, ...corrected })
        .some((key) => key !== 'page' && current[key] !== corrected[key]);
      if (changedFilter) corrected.page = 1;
      return corrected;
    });
  };

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setFetchError('');
    axios.get('/api/routes', { params: filters, signal: controller.signal })
      .then((response) => setData(response.data))
      .catch((error) => {
        if (!axios.isCancel(error)) {
          console.error('Error fetching routes:', error);
          setFetchError('Routes could not be loaded. Please try again.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [filters]);

  useEffect(() => {
    axios.get('/api/routes/date_range')
      .then((response) => setDateRange(response.data))
      .catch((error) => console.error('Error loading date range:', error));
  }, []);

  useEffect(() => {
    if (!viewPanel) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!viewHeaderRef.current?.contains(event.target)) setViewPanel(null);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setViewPanel(null);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [viewPanel]);

  const formatMetric = (number) => formatNumber(number, formattingOptions);

  const formatLoadFactor = (value) => {
    if (value == null) return '—';
    return Intl.NumberFormat(undefined, {
      minimumFractionDigits: formattingOptions.decimalPrecision || 0,
      maximumFractionDigits: formattingOptions.decimalPrecision || 0,
    }).format(value * 100) + '%';
  };

  const aircraftLabel = (route) => {
    const aircraft = aircraftCodes.find((item) => item.code === String(route.aircraft_type));
    if (!aircraft) return route.aircraft_type;
    const icao = Array.isArray(aircraft.icao) ? aircraft.icao.join(', ') : aircraft.icao;
    const format = formattingOptions.aircraftLabelFormat || 'name_icao';
    if (format === 'icao_only') return icao || aircraft.name;
    if (format === 'name_only') return aircraft.name;
    return aircraft.name + (icao ? ' (' + icao + ')' : '');
  };

  const airlineLabel = (code) => {
    const name = airlineCodes[code];
    const format = formattingOptions.airlineLabelFormat || 'name_only';
    if (format === 'iata_only') return code;
    if (format === 'iata_name') return name ? code + ' - ' + name : code;
    return name || code;
  };

  const handleExport = () => {
    const visibleColumnKeys = Object.keys(visibleColumns).filter((key) => visibleColumns[key]);
    const exportFilters = { ...filters, visible_columns: visibleColumnKeys, per_flight: formattingOptions.showPerFlightAverage };
    window.open(axios.getUri({ url: '/api/routes.csv', params: exportFilters }), '_blank');
  };

  const toggleViewPanel = (name) => setViewPanel((current) => current === name ? null : name);
  const viewButton = (name, label, detail) => (
    <button type="button" className={'dashboard-view-button' + (viewPanel === name ? ' active' : '')} onClick={() => toggleViewPanel(name)} aria-expanded={viewPanel === name} aria-controls="dashboard-view-panel">
      <span>{label}</span>
      {detail && <span className="dashboard-view-detail">{detail}</span>}
      <i className={`fa fa-chevron-${viewPanel === name ? 'up' : 'down'}`} aria-hidden="true" />
    </button>
  );
  const groupingSummary = (filters.group_by || []).map((key) => groupLabels[key] || key).join(', ') || 'None';
  const visibleColumnCount = columnKeys.filter((key) => visibleColumns[key]).length;
  const resultCount = data.total_items ?? 0;
  const totalPages = data.total_pages || 1;
  const currentPage = Number(filters.page) || 1;

  return (
    <div className="dashboard-app">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar-inner">
          <a className="dashboard-brand" href="/"><span className="dashboard-mark">a</span> airline stats</a>
          <nav className="dashboard-nav" aria-label="Main navigation"><span className="dashboard-nav-current">Explore</span></nav>
          {dateRange.to_date && <span className="dashboard-data-status">T-100 data through {dayjs(dateRange.to_date).format('MMM YYYY')}</span>}
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-page-heading">
          <div><h1>Route explorer</h1><p>Explore monthly traffic by airline, airport, and route.</p></div>
          <div className="dashboard-page-actions">
            <Actions filters={filters} />
            <button type="button" className="dashboard-button dashboard-button-primary" onClick={handleExport} disabled={visibleColumnCount === 0}>
              <i className="fa fa-download" aria-hidden="true" /> Export CSV
            </button>
          </div>
        </div>

        {isSavedSearchView && savedSearch && (
          <div className="dashboard-saved-banner">Viewing saved search{savedSearch.search_name ? ': ' + savedSearch.search_name : ''}. Change a filter to create a new view.</div>
        )}

        <section className="dashboard-filter-panel" aria-label="Route filters">
          <AirportFilter filters={filters} setFilters={handleFilterChange} />
          <div className="dashboard-secondary-row">
            <div className="dashboard-secondary-filters">
              <BaseFilter setFilters={handleFilterChange} filters={filters} component={CountryFilter} />
              <BaseFilter setFilters={handleFilterChange} filters={filters} component={DateFilter} componentProps={{ latestAvailableMonth: dateRange.to_date }} />
              <BaseFilter setFilters={handleFilterChange} filters={filters} component={AirlineFilter} />
              <BaseFilter setFilters={handleFilterChange} filters={filters} component={AircraftFilter} />
              <BaseFilter setFilters={handleFilterChange} filters={filters} component={ClassFilter} />
            </div>
          </div>
        </section>

        <section className="dashboard-results" aria-label="Route results">
          <div className="dashboard-table-card" aria-busy={isLoading}>
            <div className="dashboard-results-header" ref={viewHeaderRef}>
              <div className="dashboard-results-title">
                <h2>Traffic results</h2>
                <span>{resultCount.toLocaleString()} rows</span>
              </div>
              <div className="dashboard-result-tools" aria-label="Table view controls">
                {viewButton('grouping', 'Group by', groupingSummary)}
                {viewButton('columns', 'Columns', `${visibleColumnCount}/${columnKeys.length}`)}
                {viewButton('formatting', 'Display')}
              </div>
              {viewPanel && (
                <div id="dashboard-view-panel" className={`dashboard-view-panel dashboard-view-panel-${viewPanel}`} role="dialog" aria-label={viewPanel === 'grouping' ? 'Group rows by' : viewPanel === 'columns' ? 'Visible columns' : 'Display settings'}>
                  <div className="dashboard-view-panel-heading">
                    <div>
                      <h3>{viewPanel === 'grouping' ? 'Group rows by' : viewPanel === 'columns' ? 'Visible columns' : 'Display settings'}</h3>
                      <p>{viewPanel === 'grouping' ? 'Choose the dimensions for each row.' : viewPanel === 'columns' ? 'Show the metrics you need.' : 'Adjust how values and labels appear.'}</p>
                    </div>
                    <button type="button" className="dashboard-panel-close" onClick={() => setViewPanel(null)} aria-label="Close view settings">×</button>
                  </div>
                  {viewPanel === 'grouping' && <GroupingTab filters={filters} setFilters={handleFilterChange} />}
                  {viewPanel === 'columns' && <ColumnsTab visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />}
                  {viewPanel === 'formatting' && <FormattingTab formattingOptions={formattingOptions} setFormattingOptions={setFormattingOptions} />}
                </div>
              )}
            </div>
            <div className="dashboard-table-scroll">
              <table className="dashboard-table">
                <thead><TableHeader filters={filters} setFilters={handleFilterChange} visibleColumns={visibleColumns} formattingOptions={formattingOptions} /></thead>
                <tbody>
                  {data.routes?.map((route, index) => (
                    <tr key={(filters.group_by || []).map((column) => route[column] ?? '').join('-') + '-' + index}>
                      {filters.group_by?.includes('carrier') && <td>{airlineLabel(route.carrier)}</td>}
                      {filters.group_by?.includes('aircraft_type') && <td>{aircraftLabel(route)}</td>}
                      {filters.group_by?.includes('origin') && <td>{route.origin}</td>}
                      {filters.group_by?.includes('dest') && <td>{route.dest}</td>}
                      {filters.group_by?.includes('origin_country') && <td>{route.origin_country}</td>}
                      {filters.group_by?.includes('dest_country') && <td>{route.dest_country}</td>}
                      {filters.group_by?.includes('month') && <td>{route.month?.substring(0, 7)}</td>}
                      {filters.group_by?.includes('quarter') && <td>{route.quarter?.substring(0, 4)} {quarterMap[route.quarter?.substring(5, 7)]}</td>}
                      {filters.group_by?.includes('year') && <td>{route.year?.substring(0, 4)}</td>}
                      {visibleColumns.departures_performed && <td>{formatMetric(route.departures_performed)}</td>}
                      {visibleColumns.seats && <td>{formatMetric(route.seats)} {formattingOptions.showPerFlightAverage && route.seats_per_flight != null && '(' + formatMetric(route.seats_per_flight) + ')'}</td>}
                      {visibleColumns.asms && <td className="hidden md:table-cell">{formatMetric(route.asms)}</td>}
                      {visibleColumns.passengers && <td>{formatMetric(route.passengers)} {formattingOptions.showPerFlightAverage && route.passengers_per_flight != null && '(' + formatMetric(route.passengers_per_flight) + ')'}</td>}
                      {visibleColumns.rpms && <td className="hidden md:table-cell">{formatMetric(route.rpms)}</td>}
                      {visibleColumns.load_factor && <td>{formatLoadFactor(route.load_factor)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isLoading && <div className="dashboard-empty" role="status">Loading routes…</div>}
            {!isLoading && fetchError && <div className="dashboard-empty" role="alert">{fetchError}</div>}
            {!isLoading && !fetchError && data.routes?.length === 0 && <div className="dashboard-empty">No routes match these filters.</div>}
            <div className="dashboard-results-count">{resultCount.toLocaleString()} total results</div>
          </div>

          <div className="dashboard-pagination">
            <label>Rows per page
              <select value={filters.items_per_page || 20} onChange={(event) => handleFilterChange({ ...filters, page: 1, items_per_page: event.target.value })}>
                <option value="20">20</option><option value="40">40</option><option value="60">60</option><option value="80">80</option>
              </select>
            </label>
            <span>Page {currentPage} of {totalPages}</span>
            <div className="dashboard-pagination-actions">
              <PagingButton disabled={currentPage <= 1 || isLoading} onClick={() => handleFilterChange({ ...filters, page: currentPage - 1 })}>Previous</PagingButton>
              <PagingButton disabled={currentPage >= totalPages || isLoading} onClick={() => handleFilterChange({ ...filters, page: currentPage + 1 })}>Next</PagingButton>
            </div>
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>{dateRange.from_date && dateRange.to_date ? 'Data available: ' + dayjs(dateRange.from_date).format('MMM YYYY') + '–' + dayjs(dateRange.to_date).format('MMM YYYY') : 'T-100 airline traffic data'}</span>
          <span>Questions or feedback? <a href="mailto:info@airlinestats.io">info@airlinestats.io</a></span>
        </footer>
      </main>
    </div>
  );
}
