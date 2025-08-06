SELECT
    DATE_TRUNC('month', month)::date AS month,
    carrier,
    origin,
    dest,
    origin_country,
    dest_country,
    aircraft_type,
    service_class,
    SUM(departures_scheduled) AS departures_scheduled,
    SUM(departures_performed) AS departures_performed,
    SUM(seats) AS seats,
    SUM(passengers) AS passengers,
    SUM(seats * distance) AS asms,
    SUM(passengers * distance) AS rpms
FROM
    routes
GROUP BY
    DATE_TRUNC('month', month),
    carrier,
    origin,
    dest,
    origin_country,
    dest_country,
    aircraft_type,
    service_class;
