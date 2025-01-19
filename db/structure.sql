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
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: index_routes_on_aircraft_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_aircraft_type ON public.routes USING btree (aircraft_type);


--
-- Name: index_routes_on_departures_performed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_departures_performed ON public.routes USING btree (departures_performed);


--
-- Name: index_routes_on_departures_scheduled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_departures_scheduled ON public.routes USING btree (departures_scheduled);


--
-- Name: index_routes_on_dest; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_dest ON public.routes USING btree (dest);


--
-- Name: index_routes_on_dest_country; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_dest_country ON public.routes USING btree (dest_country);


--
-- Name: index_routes_on_dest_state_abr; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_dest_state_abr ON public.routes USING btree (dest_state_abr);


--
-- Name: index_routes_on_distance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_distance ON public.routes USING btree (distance);


--
-- Name: index_routes_on_freight; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_freight ON public.routes USING btree (freight);


--
-- Name: index_routes_on_mail; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_mail ON public.routes USING btree (mail);


--
-- Name: index_routes_on_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_month ON public.routes USING btree (month);


--
-- Name: index_routes_on_origin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_origin ON public.routes USING btree (origin);


--
-- Name: index_routes_on_origin_country; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_origin_country ON public.routes USING btree (origin_country);


--
-- Name: index_routes_on_origin_state_abr; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_origin_state_abr ON public.routes USING btree (origin_state_abr);


--
-- Name: index_routes_on_passengers; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_passengers ON public.routes USING btree (passengers);


--
-- Name: index_routes_on_payload; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_payload ON public.routes USING btree (payload);


--
-- Name: index_routes_on_seats; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_seats ON public.routes USING btree (seats);


--
-- Name: index_routes_on_service_class; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_service_class ON public.routes USING btree (service_class);


--
-- Name: index_routes_on_unique_carrier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_routes_on_unique_carrier ON public.routes USING btree (unique_carrier);


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('20230409074143');

