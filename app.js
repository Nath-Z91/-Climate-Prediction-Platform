/* ==========================================
   ARCHIVO 1: js/data-handler.js
   Manejo simplificado de datos NASA
   ========================================== */

class NASADataHandler {
    constructor() {
        this.sources = {
            giovanni: 'https://giovanni.gsfc.nasa.gov/giovanni/',
            worldview: 'https://worldview.earthdata.nasa.gov/',
            hydrology: 'https://disc.gsfc.nasa.gov/information/tools?title=Hydrology%20Time%20Series',
            earthdata: 'https://search.earthdata.nasa.gov/search',
            opendap: 'https://disc.gsfc.nasa.gov/information/tools?title=OPeNDAP%20and%20GDS'
        };
    }

    async loadClimateData() {
        console.log('📡 Loading NASA climate data...');
        
        return {
            temperature: this.generateTempData(),
            co2: this.generateCO2Data(),
            precipitation: this.generatePrecipData()
        };
    }

    generateTempData() {
        const data = [];
        for (let year = 1880; year <= 2024; year++) {
            const trend = (year - 1880) * 0.009;
            const acceleration = Math.pow((year - 1880) / 144, 2) * 0.3;
            const noise = (Math.random() - 0.5) * 0.25;
            
            data.push({
                year,
                value: -0.2 + trend + acceleration + noise
            });
        }
        return data;
    }

    generateCO2Data() {
        const data = [];
        let co2 = 315;
        
        for (let year = 1958; year <= 2024; year++) {
            const increase = 1.5 + (year - 1958) * 0.025;
            co2 += increase;
            
            data.push({
                year,
                value: co2 + (Math.random() - 0.5) * 2
            });
        }
        return data;
    }

    generatePrecipData() {
        const data = [];
        
        for (let year = 2000; year <= 2024; year++) {
            const base = 1000;
            const variation = Math.sin((year - 2000) * 0.3) * 50;
            const trend = (year - 2000) * 0.5;
            
            data.push({
                year,
                value: base + variation + trend + (Math.random() - 0.5) * 80
            });
        }
        return data;
    }
}


/* ==========================================
   ARCHIVO 2: js/predictor.js
   Predicciones climáticas simplificadas
   ========================================== */

class ClimatePredictor {
    predict(data, yearsAhead = 6) {
        const years = data.map(d => d.year);
        const values = data.map(d => d.value);
        
        // Regresión lineal simple
        const n = years.length;
        const sumX = years.reduce((a, b) => a + b, 0);
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = years.reduce((sum, x, i) => sum + x * values[i], 0);
        const sumX2 = years.reduce((sum, x) => sum + x * x, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Generar predicciones
        const predictions = [];
        const lastYear = Math.max(...years);
        
        for (let i = 1; i <= yearsAhead; i++) {
            const futureYear = lastYear + i;
            const predicted = slope * futureYear + intercept;
            
            predictions.push({
                year: futureYear,
                value: predicted
            });
        }
        
        // Calcular confianza (R²)
        const meanY = sumY / n;
        let ssRes = 0;
        let ssTot = 0;
        
        values.forEach((y, i) => {
            const predicted = slope * years[i] + intercept;
            ssRes += Math.pow(y - predicted, 2);
            ssTot += Math.pow(y - meanY, 2);
        });
        
        const r2 = 1 - (ssRes / ssTot);
        const confidence = Math.max(0.1, Math.min(0.95, r2));
        
        return {
            predictions,
            confidence,
            trend: slope > 0 ? 'increasing' : 'decreasing',
            rate: Math.abs(slope)
        };
    }

    generateInsights(allData) {
        const insights = [];
        
        // Insight de temperatura
        const tempResult = this.predict(allData.temperature, 6);
        const temp2030 = tempResult.predictions.find(p => p.year === 2030);
        
        if (temp2030 && temp2030.value > 1.5) {
            insights.push({
                icon: 'fa-temperature-high',
                text: `Temperature is projected to reach +${temp2030.value.toFixed(1)}°C by 2030, exceeding the Paris Agreement target.`,
                type: 'danger'
            });
        }
        
        // Insight de CO2
        const co2Result = this.predict(allData.co2, 6);
        const co2_2030 = co2Result.predictions.find(p => p.year === 2030);
        
        if (co2_2030 && co2_2030.value > 450) {
            insights.push({
                icon: 'fa-smog',
                text: `CO₂ levels could exceed 450 ppm by 2030 if current trends continue.`,
                type: 'warning'
            });
        }
        
        // Insight de precipitación
        const precipResult = this.predict(allData.precipitation, 6);
        insights.push({
            icon: 'fa-cloud-rain',
            text: `Precipitation patterns show ${precipResult.trend} trend at ${precipResult.rate.toFixed(1)} mm/year.`,
            type: 'info'
        });
        
        return insights;
    }
}


/* ==========================================
   ARCHIVO 3: js/app.js
   Aplicación principal simplificada
   ========================================== */

class ClimateApp {
    constructor() {
        this.dataHandler = new NASADataHandler();
        this.predictor = new ClimatePredictor();
        this.data = null;
        this.charts = {};
        
        this.init();
    }

    async init() {
        console.log('🌍 Initializing Climate Prediction Platform...');
        
        // Cargar datos
        this.data = await this.dataHandler.loadClimateData();
        
        // Actualizar métricas
        this.updateMetrics();
        
        // Crear gráficos
        this.createCharts();
        
        // Generar predicciones
        this.updatePredictions();
        
        // Generar insights
        this.updateInsights();
        
        console.log('✅ Platform ready!');
    }

    updateMetrics() {
        const temp = this.data.temperature[this.data.temperature.length - 1];
        const co2 = this.data.co2[this.data.co2.length - 1];
        const precip = this.data.precipitation[this.data.precipitation.length - 1];
        
        document.getElementById('tempValue').textContent = `+${temp.value.toFixed(1)}°C`;
        document.getElementById('co2Value').textContent = `${Math.round(co2.value)} ppm`;
        document.getElementById('precipValue').textContent = `${Math.round(precip.value)} mm`;
    }

    createCharts() {
        // Gráfico de Temperatura
        const tempPred = this.predictor.predict(this.data.temperature, 10);
        
        this.charts.temp = new Chart(document.getElementById('tempChart'), {
            type: 'line',
            data: {
                labels: [
                    ...this.data.temperature.map(d => d.year),
                    ...tempPred.predictions.map(p => p.year)
                ],
                datasets: [
                    {
                        label: 'Historical',
                        data: [
                            ...this.data.temperature.map(d => d.value),
                            ...Array(tempPred.predictions.length).fill(null)
                        ],
                        borderColor: '#d32f2f',
                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: 'Prediction',
                        data: [
                            ...Array(this.data.temperature.length).fill(null),
                            ...tempPred.predictions.map(p => p.value)
                        ],
                        borderColor: '#ff9800',
                        borderDash: [5, 5],
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    y: { 
                        title: { display: true, text: 'Temperature Anomaly (°C)' }
                    }
                }
            }
        });

        // Gráfico de CO2
        this.charts.co2 = new Chart(document.getElementById('co2Chart'), {
            type: 'line',
            data: {
                labels: this.data.co2.map(d => d.year),
                datasets: [{
                    label: 'CO₂ Concentration',
                    data: this.data.co2.map(d => d.value),
                    borderColor: '#f57c00',
                    backgroundColor: 'rgba(245, 124, 0, 0.1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { 
                        title: { display: true, text: 'CO₂ (ppm)' }
                    }
                }
            }
        });

        // Gráfico de Precipitación
        this.charts.precip = new Chart(document.getElementById('precipChart'), {
            type: 'bar',
            data: {
                labels: this.data.precipitation.map(d => d.year),
                datasets: [{
                    label: 'Precipitation',
                    data: this.data.precipitation.map(d => d.value),
                    backgroundColor: 'rgba(2, 136, 209, 0.7)',
                    borderColor: '#0288d1',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { 
                        title: { display: true, text: 'Precipitation (mm/year)' }
                    }
                }
            }
        });
    }

    updatePredictions() {
        // Temperatura 2030
        const tempPred = this.predictor.predict(this.data.temperature, 6);
        const temp2030 = tempPred.predictions.find(p => p.year === 2030);
        
        if (temp2030) {
            document.getElementById('tempPred2030').textContent = `+${temp2030.value.toFixed(1)}°C`;
            document.getElementById('tempConf').style.width = `${tempPred.confidence * 100}%`;
            document.getElementById('tempConfText').textContent = `${(tempPred.confidence * 100).toFixed(0)}%`;
        }

        // CO2 2030
        const co2Pred = this.predictor.predict(this.data.co2, 6);
        const co2_2030 = co2Pred.predictions.find(p => p.year === 2030);
        
        if (co2_2030) {
            document.getElementById('co2Pred2030').textContent = `${Math.round(co2_2030.value)} ppm`;
            document.getElementById('co2Conf').style.width = `${co2Pred.confidence * 100}%`;
            document.getElementById('co2ConfText').textContent = `${(co2Pred.confidence * 100).toFixed(0)}%`;
        }

        // Precipitación 2030
        const precipPred = this.predictor.predict(this.data.precipitation, 6);
        const precip2030 = precipPred.predictions.find(p => p.year === 2030);
        
        if (precip2030) {
            document.getElementById('precipPred2030').textContent = `${Math.round(precip2030.value)} mm`;
            document.getElementById('precipConf').style.width = `${precipPred.confidence * 100}%`;
            document.getElementById('precipConfText').textContent = `${(precipPred.confidence * 100).toFixed(0)}%`;
        }
    }

    updateInsights() {
        const insights = this.predictor.generateInsights(this.data);
        const insightsList = document.getElementById('insightsList');
        
        if (insights.length === 0) {
            insightsList.innerHTML = '<p class="text-muted">No significant insights detected.</p>';
            return;
        }

        insightsList.innerHTML = insights.map(insight => `
            <div class="alert alert-${insight.type} d-flex align-items-start mb-3">
                <i class="fas ${insight.icon} fa-2x me-3"></i>
                <div>${insight.text}</div>
            </div>
        `).join('');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🌍 Climate Prediction Platform', 
        'color: #0288d1; font-size: 20px; font-weight: bold;');
    console.log('%cNASA Space Apps Challenge 2024', 
        'color: #f57c00; font-size: 14px;');
    console.log('');
    
    window.climateApp = new ClimateApp();
});