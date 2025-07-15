const axios = require('axios');

// Climate data service for integrating with external APIs
class ClimateService {
    constructor() {
        // You can integrate with APIs like:
        // - NOAA Climate Data API
        // - OpenWeatherMap Climate API
        // - NASA Climate Change API
        // - First Street Foundation API (flood risk)
        // - Wildfire Risk APIs
    }

    // Get climate risk data for a specific location
    async getClimateRisk(lat, lng, hazardType = 'all') {
        try {
            // Example integration with climate API
            // const response = await axios.get(`https://api.climate-service.com/risk`, {
            //   params: { lat, lng, hazard: hazardType }
            // });

            // For now, return calculated risk based on geographic location
            return this.calculateRiskByLocation(lat, lng, hazardType);
        } catch (error) {
            console.error('Error fetching climate data:', error);
            return { risk: 'unknown', value: 0 };
        }
    }

    // Calculate risk based on geographic patterns (proxy method)
    calculateRiskByLocation(lat, lng, hazardType) {
        const risks = {
            flood: this.calculateFloodRisk(lat, lng),
            fire: this.calculateFireRisk(lat, lng),
            wind: this.calculateWindRisk(lat, lng),
            heat: this.calculateHeatRisk(lat, lng)
        };

        if (hazardType === 'all') {
            return risks;
        }

        return { [hazardType]: risks[hazardType] };
    }

    calculateFloodRisk(lat, lng) {
        // Higher flood risk for coastal areas and low-lying regions
        const coastalStates = {
            'FL': 0.8, 'LA': 0.9, 'TX': 0.6, 'CA': 0.5, 'NY': 0.4, 'NC': 0.6, 'SC': 0.7
        };

        // Simplified risk calculation based on latitude (coastal proximity)
        let riskScore = 0.2; // Base risk

        if (lat < 30 && lng > -100) riskScore += 0.4; // Gulf Coast
        if (lat > 25 && lat < 28 && lng > -85) riskScore += 0.5; // Florida
        if (lat > 29 && lat < 31 && lng < -90) riskScore += 0.6; // Louisiana

        return Math.min(riskScore, 1.0);
    }

    calculateFireRisk(lat, lng) {
        // Higher fire risk for western states and dry regions
        let riskScore = 0.1; // Base risk

        if (lng < -100) riskScore += 0.3; // Western states
        if (lng < -115 && lat > 32 && lat < 42) riskScore += 0.4; // California
        if (lng < -110 && lat > 31 && lat < 37) riskScore += 0.3; // Arizona/Nevada

        return Math.min(riskScore, 1.0);
    }

    calculateWindRisk(lat, lng) {
        // Higher wind risk for tornado alley and hurricane zones
        let riskScore = 0.1; // Base risk

        // Tornado Alley
        if (lat > 32 && lat < 42 && lng > -105 && lng < -90) riskScore += 0.5;

        // Hurricane zones (Atlantic and Gulf coasts)
        if (lat > 25 && lat < 35 && lng > -85) riskScore += 0.4;
        if (lat > 28 && lat < 32 && lng > -95 && lng < -85) riskScore += 0.6;

        return Math.min(riskScore, 1.0);
    }

    calculateHeatRisk(lat, lng) {
        // Higher heat risk for southwestern states
        let riskScore = 0.1; // Base risk

        if (lat > 31 && lat < 37 && lng < -110) riskScore += 0.6; // Arizona/Nevada
        if (lat > 25 && lat < 32 && lng < -100 && lng > -107) riskScore += 0.4; // Texas
        if (lat > 32 && lat < 40 && lng < -115) riskScore += 0.3; // California inland

        return Math.min(riskScore, 1.0);
    }

    // Calculate portfolio-wide climate exposure
    async calculatePortfolioClimateRisk(loans) {
        const climateRisks = {
            flood: { totalExposure: 0, affectedLoans: 0 },
            fire: { totalExposure: 0, affectedLoans: 0 },
            wind: { totalExposure: 0, affectedLoans: 0 },
            heat: { totalExposure: 0, affectedLoans: 0 }
        };

        for (const loan of loans) {
            if (loan.lat && loan.lng) {
                const risks = await this.getClimateRisk(loan.lat, loan.lng);

                Object.keys(climateRisks).forEach(hazard => {
                    const riskScore = risks[hazard] || 0;
                    if (riskScore > 0.3) { // Threshold for significant risk
                        climateRisks[hazard].totalExposure += loan.value * riskScore;
                        climateRisks[hazard].affectedLoans += 1;
                    }
                });
            }
        }

        return climateRisks;
    }
}

module.exports = new ClimateService();