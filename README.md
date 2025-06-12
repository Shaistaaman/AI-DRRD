# AI-Powered Disaster Risk Resilience Dashboard (AIDRRD)

A comprehensive solution for enhancing banking resilience with physical risk analytics.

## Overview

AIDRRD helps financial institutions assess and manage climate-driven physical risks by:
- Linking high-resolution hazard forecasts to property-level exposures
- Quantifying portfolio loss under extreme-weather scenarios
- Providing actionable insights for risk managers and traders

## Features

- **Data Ingestion & Normalization**: Process hazard layers and mortgage data
- **Risk Modeling**: Translate hazard severity into expected loss using vulnerability curves
- **Interactive Visualization**: Map-based dashboard with drill-down capabilities
- **Scenario Analysis**: "What-if" simulations for different hazard intensities
- **Reporting**: Export machine-readable files for integration with risk systems
- **Audit Trail**: Log all scenario runs for compliance and model risk management

## Tech Stack

- **Frontend**: React.js with Material-UI and Framer Motion for microanimations
- **Backend**: Node.js with Express
- **Data Processing**: Python with pandas and GeoPandas
- **Visualization**: Mapbox GL JS and D3.js
- **Database**: MongoDB for portfolio data and PostgreSQL with PostGIS for spatial data
- **Deployment**: AWS Serverless (Lambda, API Gateway, S3)

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install` for frontend and backend
3. Set up environment variables
4. Run the development server with `npm run dev`