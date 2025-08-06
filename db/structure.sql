SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: routes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.routes (
    id bigint NOT NULL,
    departures_scheduled integer,
    departures_performed integer,
    payload integer,
    seats integer,
    passengers integer,
    freight integer,
    mail integer,
    distance integer,
    ramp_to_ramp integer,
    air_time integer,
    unique_carrier character varying,
    airline_id integer,
    unique_carrier_name character varying,
    unique_carrier_entity character varying,
    carrier character varying,
    carrier_name character varying,
    carrier_group integer,
    carrier_group_new integer,
    origin_airport_id integer,
    origin_airport_seq_id integer,
    origin_city_market_id integer,
    origin character varying,
    origin_city_name character varying,
    origin_state_abr character varying,
    origin_country character varying,
    dest_airport_id integer,
    dest_airport_seq_id integer,
    dest_city_market_id integer,
    dest character varying,
    dest_city_name character varying,
    dest_state_abr character varying,
    dest_country character varying,
    aircraft_group integer,
    aircraft_type integer,
    aircraft_config integer,
    month date,
    service_class character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: route_summaries; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.route_summaries AS
 SELECT (date_trunc('month'::text, (month)::timestamp with time zone))::date AS month,
    carrier,
    origin,
    dest,
    origin_country,
    dest_country,
    aircraft_type,
    service_class,
    sum(departures_scheduled) AS departures_scheduled,
    sum(departures_performed) AS departures_performed,
    sum(seats) AS seats,
    sum(passengers) AS passengers,
    sum((seats * distance)) AS asms,
    sum((passengers * distance)) AS rpms
   FROM public.routes
  GROUP BY (date_trunc('month'::text, (month)::timestamp with time zone)), carrier, origin, dest, origin_country, dest_country, aircraft_type, service_class
  WITH NO DATA;


--
-- Name: routes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.routes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: routes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.routes_id_seq OWNED BY public.routes.id;


--
-- Name: saved_searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_searches (
    id bigint NOT NULL,
    search_name character varying,
    params jsonb NOT NULL,
    shareable_id character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: saved_searches_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.saved_searches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: saved_searches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.saved_searches_id_seq OWNED BY public.saved_searches.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: routes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routes ALTER COLUMN id SET DEFAULT nextval('public.routes_id_seq'::regclass);


--
-- Name: saved_searches id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_searches ALTER COLUMN id SET DEFAULT nextval('public.saved_searches_id_seq'::regclass);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: routes routes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);


--
-- Name: saved_searches saved_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_searches
    ADD CONSTRAINT saved_searches_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: idx_route_summaries_carrier_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_route_summaries_carrier_month ON public.route_summaries USING btree (carrier, month);


--
-- Name: idx_route_summaries_carrier_no_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_route_summaries_carrier_no_month ON public.route_summaries USING btree (carrier);


--
-- Name: idx_route_summaries_countries_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_route_summaries_countries_month ON public.route_summaries USING btree (origin_country, dest_country, month);


--
-- Name: idx_route_summaries_countries_no_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_route_summaries_countries_no_month ON public.route_summaries USING btree (origin_country, dest_country);


--
-- Name: idx_route_summaries_dest_country_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_route_summaries_dest_country_month ON public.route_summaries USING btree (dest_country, origin_country, month);


--
-- Name: idx_route_summaries_dest_country_no_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_route_summaries_dest_country_no_month ON public.route_summaries USING btree (dest_country, origin_country);


--
-- Name: idx_route_summaries_dest_origin_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_route_summaries_dest_origin_month ON public.route_summaries USING btree (dest, origin, month);


--
-- Name: idx_route_summaries_origin_dest_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_route_summaries_origin_dest_month ON public.route_summaries USING btree (origin, dest, month);


--
-- Name: idx_route_summaries_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_route_summaries_unique ON public.route_summaries USING btree (month, carrier, origin, dest, origin_country, dest_country, aircraft_type, service_class);


--
-- Name: index_saved_searches_on_shareable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_saved_searches_on_shareable_id ON public.saved_searches USING btree (shareable_id);


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('20250807034136'),
('20250807034135'),
('20250807034134'),
('20250807034133'),
('20250807034132'),
('20250807034131'),
('20250807032332'),
('20250806182501'),
('20230409074143');

