# airlinestats.io

## Overview
[airlinestats.io](http://airlinestats.io) is a tool that provides insights into airline operations, including:
- **Which airlines fly where**
- **Monthly passenger numbers**
- **Load factors and other key metrics**

## Tech Stack
- **Backend**: Ruby on Rails 7 (leveraging async queries for speed)
- **Frontend**: React

## Data Source
We use **T-100 data** from the U.S. Department of Transportation, covering **both U.S. domestic and international airlines**.

## Features
- Fast and efficient data retrieval using Rails 7 async queries
- Comprehensive airline statistics and trends
- Ongoing development for additional features

## Setup
### Importing Data
To import data, use the following commands:
```ruby
ImportT100Data.import(file_name)
# or
ImportT100Data.import_from_url(file_url)
```
You can download the required data from the DOT here: [T-100 Data](https://www.transtats.bts.gov/DL_SelectFields.aspx?gnoyr_VQ=FMG&QO_fu146_anzr=Nv4+Pn44vr45).

### Running locally
To start the local development server, run:
```sh
npm run dev
```
