# AIDRRD Database Entity-Relationship Diagram

```
+-------------------+        +-------------------+        +-------------------+
|     Portfolio     |        |       Loan        |        |    Risk_Hotspot   |
+-------------------+        +-------------------+        +-------------------+
| region_name (PK)  |<---+   | loan_id (PK)      |        | region (PK)       |
| loan_count        |    |   | address           |        | hazard_type (PK)  |
| total_value       |    |   | value             |        | expected_loss     |
+-------------------+    |   | ltv               |        | latitude          |
                         |   | risk_level        |        | longitude         |
                         +---| region (FK)       |        +-------------------+
                             +-------------------+                |
                                      |                          |
                                      |                          |
                                      v                          |
+-------------------+        +-------------------+               |
| Risk_Distribution |        |    Hazard_Type    |<--------------+
+-------------------+        +-------------------+
| risk_level (PK)   |        | hazard_id (PK)    |
| property_count    |<------>| name              |
| percentage        |        | description       |
+-------------------+        +-------------------+
                                      |
                                      |
                                      v
+-------------------+        +-------------------+        +-------------------+
| Historical_Hazard |        | Historical_Loss   |        |   Risk_Exposure   |
+-------------------+        +-------------------+        +-------------------+
| hazard_type (FK)  |        | year (PK)         |        | hazard_type (PK)  |
| year (PK)         |        | loss_value        |        | exposure_value    |
| severity          |        +-------------------+        +-------------------+
| damage_usd        |
+-------------------+

+-------------------+        +-------------------+
|   Map_Region      |        | Analysis_History  |
+-------------------+        +-------------------+
| region_value (PK) |        | analysis_id (PK)  |
| region_label      |        | timestamp         |
| latitude          |        | hazard_type       |
| longitude         |        | return_period     |
+-------------------+        | total_expected_loss|
                             | affected_properties|
                             | percentage_of_portfolio|
                             | ltv_impact        |
                             +-------------------+
```

## Entity Descriptions

### Portfolio
- Contains regional portfolio data
- Primary Key: region_name
- Attributes: loan_count, total_value

### Loan
- Contains individual loan data
- Primary Key: loan_id
- Foreign Key: region (references Portfolio.region_name)
- Attributes: address, value, ltv, risk_level

### Risk_Hotspot
- Contains risk hotspot data for specific regions and hazard types
- Composite Primary Key: region, hazard_type
- Attributes: expected_loss, latitude, longitude

### Hazard_Type
- Contains hazard type definitions
- Primary Key: hazard_id
- Attributes: name, description

### Historical_Hazard
- Contains historical hazard data
- Composite Primary Key: hazard_type, year
- Attributes: severity, damage_usd

### Historical_Loss
- Contains historical loss data by year
- Primary Key: year
- Attributes: loss_value

### Risk_Distribution
- Contains risk level distribution data
- Primary Key: risk_level
- Attributes: property_count, percentage

### Risk_Exposure
- Contains risk exposure data by hazard type
- Primary Key: hazard_type
- Attributes: exposure_value

### Map_Region
- Contains map region data with coordinates
- Primary Key: region_value
- Attributes: region_label, latitude, longitude

### Analysis_History
- Contains analysis history data
- Primary Key: analysis_id
- Attributes: timestamp, hazard_type, return_period, total_expected_loss, affected_properties, percentage_of_portfolio, ltv_impact

## Weather Impact Analysis Flow

1. **Data Collection**:
   - Loan data with geographic coordinates
   - Current weather conditions by region
   - Historical hazard data

2. **Risk Assessment**:
   - Match loans to regions
   - Identify regions with active weather alerts
   - Calculate potential exposure based on risk_level and hazard_type

3. **Impact Calculation**:
   - For each affected region, calculate:
     - Number of properties at risk
     - Total value exposed
     - Expected loss based on hazard severity
     - LTV impact

4. **Visualization**:
   - Display affected regions on risk map
   - Show portfolio exposure metrics
   - Generate risk distribution charts