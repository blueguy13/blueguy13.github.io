class Garden {
    constructor() {
        this.gridSize = { rows: 6, cols: 8 };
        this.plots = [];
        this.selectedSeed = 'carrot';
        this.plantCount = 0;
        this.waterLevel = 100;
        this.money = 10;
        this.plants = {
            carrot: { emoji: '🥕', growTime: 2000, water: 5, cost: 10, sellMin: 11, sellMax: 35 },
            sunflower: { emoji: '🌻', growTime: 3500, water: 10, cost: 50, sellMin: 55, sellMax: 150 },
            tulip: { emoji: '🌷', growTime: 3500, water: 8, cost: 100, sellMin: 110, sellMax: 300 },
            rose: { emoji: '🌹', growTime: 4000, water: 15, cost: 250, sellMin: 275, sellMax: 750 },
            corn: { emoji: '🌽', growTime: 4000, water: 12, cost: 500, sellMin: 550, sellMax: 1500 },
            tomato: { emoji: '🍅', growTime: 5000, water: 10, cost: 1000, sellMin: 1100, sellMax: 3000 },
            pumpkin: { emoji: '🎃', growTime: 5500, water: 20, cost: 2500, sellMin: 2750, sellMax: 7500 },
            tree: { emoji: '🌳', growTime: 6000, water: 25, cost: 5000, sellMin: 5500, sellMax: 15000 },
            cactus: { emoji: '🌵', growTime: 6000, water: 5, cost: 10000, sellMin: 11000, sellMax: 30000 },
            bamboo: { emoji: '🎋', growTime: 7000, water: 15, cost: 25000, sellMin: 27500, sellMax: 75000 },
            sakura: { emoji: '🌸', growTime: 8000, water: 18, cost: 50000, sellMin: 55000, sellMax: 150000 },
            palm: { emoji: '🌴', growTime: 8500, water: 30, cost: 100000, sellMin: 110000, sellMax: 300000 },
            mushroom: { emoji: '🍄', growTime: 9000, water: 8, cost: 250000, sellMin: 275000, sellMax: 750000 },
            lotus: { emoji: '🪷', growTime: 9500, water: 25, cost: 500000, sellMin: 550000, sellMax: 1500000 },
            godfruit: { emoji: '🍇', growTime: 15000, water: 50, cost: 25000000, sellMin: 26000000, sellMax: 41000000 },
            ancient: { emoji: '🌲', growTime: 15000, water: 60, cost: 2500000, sellMin: 2750000, sellMax: 4100000 },
            crystal: { emoji: '🪷', growTime: 15000, water: 70, cost: 5000000, sellMin: 5500000, sellMax: 8200000 },
            void: { emoji: '🫐', growTime: 15000, water: 80, cost: 15000000, sellMin: 16500000, sellMax: 24600000 },
            cosmic: { emoji: '🌌', growTime: 15000, water: 100, cost: 60000000, sellMin: 66000000, sellMax: 98000000 }
        };
        
        this.mutations = {
            wet: { multiplier: 2, emoji: '💧' },
            chilled: { multiplier: 5, emoji: '❄️' },
            frozen: { multiplier: 10, emoji: '🧊' },
            shocked: { multiplier: 35, emoji: '⚡' },
            stormy: { multiplier: 50, emoji: '🌪️' },
            chakra: { multiplier: 70, emoji: '🔮' },
            burnt: { multiplier: 90, emoji: '🔥' },
            corrupt: { multiplier: 120, emoji: '👹' },
            gold: { multiplier: 20, emoji: '✨' },
            rainbow: { multiplier: 70, emoji: '🌈' },
            shiny: { multiplier: 140, emoji: '💎' }
        };

        this.currentWeather = 'normal';
        this.weatherDuration = 0;
        
        this.badges = {
            carrotCaretaker: {
                name: "Carrot Caretaker",
                description: "Sell 100 total carrots",
                emoji: "🥕",
                earned: false,
                progress: 0,
                target: 100
            },
            deepPockets: {
                name: "Deep Pockets", 
                description: "Reach 25,000 sheckles",
                emoji: "💰",
                earned: false,
                progress: 0,
                target: 25000
            },
            iDidIt: {
                name: "I did it!",
                description: "Buy godfruit",
                emoji: "🍇",
                earned: false,
                progress: 0,
                target: 1
            },
            ooh: {
                name: "Ooh!",
                description: "Sell a rainbow plant",
                emoji: "🌈",
                earned: false,
                progress: 0,
                target: 1
            },
            actualGarden: {
                name: "Actual Garden",
                description: "Have every flower in your garden",
                emoji: "🌺",
                earned: false,
                progress: 0,
                target: 15
            }
        };

        this.newBadgeCount = 0;
        
        this.init();
    }
    
    init() {
        this.createGarden();
        this.setupEventListeners();
        this.loadGame(); // Load saved game before updating stats
        this.updateStats();
        this.updateWeatherDisplay();
        this.startWaterDecay();
        this.startWeatherSystem();
        this.startAutoSave();
    }

    saveGame() {
        const gameState = {
            money: this.money,
            plantCount: this.plantCount,
            waterLevel: this.waterLevel,
            selectedSeed: this.selectedSeed,
            currentWeather: this.currentWeather,
            weatherDuration: this.weatherDuration,
            plots: this.plots.map(row => 
                row.map(plot => ({
                    planted: plot.planted,
                    plant: plot.plant,
                    stage: plot.stage,
                    mutations: plot.mutations,
                    isFavorited: plot.isFavorited
                }))
            ),
            badges: this.badges,
            newBadgeCount: this.newBadgeCount,
            timestamp: Date.now()
        };
        
        localStorage.setItem('gardenSaveGame', JSON.stringify(gameState));
    }

    loadGame() {
        const savedGame = localStorage.getItem('gardenSaveGame');
        if (!savedGame) return;

        try {
            const gameState = JSON.parse(savedGame);
            
            // Load basic stats
            this.money = gameState.money || 10;
            this.plantCount = gameState.plantCount || 0;
            this.waterLevel = gameState.waterLevel || 100;
            this.selectedSeed = gameState.selectedSeed || 'carrot';
            this.currentWeather = gameState.currentWeather || 'normal';
            this.weatherDuration = gameState.weatherDuration || 0;
            
            // Load plots if they exist
            if (gameState.plots && gameState.plots.length === this.gridSize.rows) {
                gameState.plots.forEach((row, rowIndex) => {
                    if (row.length === this.gridSize.cols) {
                        row.forEach((plotData, colIndex) => {
                            const plot = this.plots[rowIndex][colIndex];
                            plot.planted = plotData.planted || false;
                            plot.plant = plotData.plant || null;
                            plot.stage = plotData.stage || 'empty';
                            plot.mutations = plotData.mutations || [];
                            plot.isFavorited = plotData.isFavorited || false;
                            
                            // Update visual display
                            this.updatePlotVisualFromSave(plot);
                            
                            // If plant is growing, resume growth timer
                            if (plot.stage === 'growing' && plot.plant) {
                                setTimeout(() => {
                                    this.growPlant(rowIndex, colIndex);
                                }, this.plants[plot.plant].growTime / 2); // Resume with half time
                            }
                        });
                    }
                });
            }
            
            // Load badges
            if (gameState.badges) {
                Object.keys(gameState.badges).forEach(badgeKey => {
                    if (this.badges[badgeKey]) {
                        this.badges[badgeKey] = { ...this.badges[badgeKey], ...gameState.badges[badgeKey] };
                    }
                });
            }
            
            this.newBadgeCount = gameState.newBadgeCount || 0;
            this.updateBadgeButton();
            
            // Update selected seed button
            document.querySelector('.seed-btn.active')?.classList.remove('active');
            document.querySelector(`[data-plant="${this.selectedSeed}"]`)?.classList.add('active');
            
        } catch (error) {
            console.error('Failed to load save game:', error);
        }
    }

    updatePlotVisualFromSave(plotData) {
        const plot = plotData.element;
        
        if (plotData.stage === 'empty') {
            plot.className = 'plot empty';
            plot.innerHTML = '';
        } else if (plotData.stage === 'growing') {
            plot.className = 'plot growing';
            plot.innerHTML = '<div class="plant">🌱</div>';
        } else if (plotData.stage === 'mature') {
            this.updatePlotDisplay(plotData);
        } else if (plotData.stage === 'withered') {
            plot.className = 'plot withered';
            plot.innerHTML = '<div class="plant">🥀</div>';
        }
    }

    startAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.saveGame();
        }, 30000);
        
        // Save when page is about to unload
        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });
    }
    
    createGarden() {
        const garden = document.getElementById('garden');
        garden.innerHTML = '';
        
        for (let row = 0; row < this.gridSize.rows; row++) {
            this.plots[row] = [];
            for (let col = 0; col < this.gridSize.cols; col++) {
                const plot = document.createElement('div');
                plot.className = 'plot empty';
                plot.dataset.row = row;
                plot.dataset.col = col;
                
                plot.addEventListener('click', (e) => this.handlePlotClick(e));
                
                garden.appendChild(plot);
                this.plots[row][col] = {
                    element: plot,
                    planted: false,
                    plant: null,
                    stage: 'empty',
                    mutations: [],
                    isFavorited: false,
                    lastClickTime: 0
                };
            }
        }
    }
    
    setupEventListeners() {
        // Seed selection
        document.querySelectorAll('.seed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const plantType = btn.dataset.plant;
                if (this.money >= this.plants[plantType].cost) {
                    document.querySelector('.seed-btn.active')?.classList.remove('active');
                    btn.classList.add('active');
                    this.selectedSeed = plantType;
                    this.saveGame(); // Save when seed selection changes
                }
            });
        });
        
        // Water button
        document.getElementById('water-btn').addEventListener('click', () => {
            this.waterGarden();
        });
        
        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGarden();
        });

        // Sell all button
        document.getElementById('sell-all-btn').addEventListener('click', () => {
            this.sellAllMaturePlants();
        });

        // Badges button
        document.getElementById('badges-btn').addEventListener('click', () => {
            this.showBadgesModal();
        });

        // Save/Load buttons
        const saveBtn = document.getElementById('save-btn');
        const loadBtn = document.getElementById('load-btn');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveGame();
                saveBtn.textContent = '💾 Saved!';
                setTimeout(() => {
                    saveBtn.textContent = '💾 Save Game';
                }, 1000);
            });
        }
        
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                this.loadGame();
                this.updateStats();
                loadBtn.textContent = '📁 Loaded!';
                setTimeout(() => {
                    loadBtn.textContent = '📁 Load Game';
                }, 1000);
            });
        }
    }

    showBadgesModal() {
        // Reset new badge count when opening modal
        this.newBadgeCount = 0;
        this.updateBadgeButton();

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'badges-modal';
        
        modal.innerHTML = `
            <h2>🏆 Badges</h2>
            <div class="badge-grid">
                ${Object.entries(this.badges).map(([key, badge]) => `
                    <div class="badge-item ${badge.earned ? 'earned' : ''}">
                        <span class="badge-emoji">${badge.emoji}</span>
                        <div class="badge-name">${badge.name}</div>
                        <div class="badge-description">${badge.description}</div>
                        <div class="badge-progress">
                            ${badge.earned ? 'COMPLETED!' : `${badge.progress}/${badge.target}`}
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="badges-close-btn">Close</button>
        `;
        
        // Add event listeners
        const closeBtn = modal.querySelector('.badges-close-btn');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            document.body.removeChild(modal);
        });
        
        overlay.addEventListener('click', () => {
            document.body.removeChild(overlay);
            document.body.removeChild(modal);
        });
        
        // Add to DOM
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
    }

    checkBadges() {
        // Carrot Caretaker - this gets updated in sellAllMaturePlants
        this.updateBadgeProgress('deepPockets', this.money);
        
        // Actual Garden - check if we have all different flower types planted
        const plantedTypes = new Set();
        this.plots.forEach(row => {
            row.forEach(plot => {
                if (plot.stage === 'mature' || plot.stage === 'growing') {
                    plantedTypes.add(plot.plant);
                }
            });
        });
        this.updateBadgeProgress('actualGarden', plantedTypes.size);
    }

    updateBadgeProgress(badgeKey, newProgress) {
        const badge = this.badges[badgeKey];
        if (!badge || badge.earned) return;
        
        badge.progress = Math.max(badge.progress, newProgress);
        
        if (badge.progress >= badge.target && !badge.earned) {
            badge.earned = true;
            this.newBadgeCount++;
            this.updateBadgeButton();
            this.showBadgeNotification(badge);
            this.saveGame();
        }
    }

    showBadgeNotification(badge) {
        // Create floating notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #333;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
            z-index: 1001;
            font-weight: 600;
            text-align: center;
            animation: slideIn 0.5s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 10px;">${badge.emoji}</div>
            <div style="font-size: 1.2rem; margin-bottom: 5px;">Badge Earned!</div>
            <div style="font-size: 1rem;">${badge.name}</div>
        `;

        // Add slide in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                0% { transform: translateX(100%); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.5s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 500);
            }
        }, 4000);
    }

    updateBadgeButton() {
        const badgeBtn = document.getElementById('badges-btn');
        const existingNotification = badgeBtn.querySelector('.badge-notification');
        
        if (existingNotification) {
            badgeBtn.removeChild(existingNotification);
        }
        
        if (this.newBadgeCount > 0) {
            const notification = document.createElement('div');
            notification.className = 'badge-notification';
            notification.textContent = this.newBadgeCount;
            badgeBtn.appendChild(notification);
        }
    }
    
    startWeatherSystem() {
        setInterval(() => {
            // Random weather events
            const rand = Math.random();
            
            if (this.currentWeather === 'normal') {
                if (rand < 0.15) { // 15% chance for rain
                    this.startWeather('rain');
                } else if (rand < 0.25) { // 10% chance for snow
                    this.startWeather('snow');
                } else if (rand < 0.27) { // 2% chance for fire
                    this.startWeather('fire');
                }
            } else if (this.currentWeather === 'rain') {
                if (rand < 0.012) { // 1.2% chance to turn into thunderstorm
                    this.startWeather('thunderstorm');
                }
                this.applyRainMutations();
            } else if (this.currentWeather === 'snow') {
                this.applySnowMutations();
            } else if (this.currentWeather === 'thunderstorm') {
                this.applyThunderstormMutations();
            } else if (this.currentWeather === 'fire') {
                this.applyFireMutations();
            }
            
            // Decrease weather duration
            if (this.currentWeather !== 'normal') {
                this.weatherDuration--;
                if (this.weatherDuration <= 0) {
                    this.currentWeather = 'normal';
                }
            }
            
            this.updateWeatherDisplay();
        }, 60000); // Check every minute
    }

    updateWeatherDisplay() {
        const weatherEmoji = document.getElementById('weather-emoji');
        const weatherName = document.getElementById('weather-name');
        const weatherDuration = document.getElementById('weather-duration');
        
        const weatherData = {
            normal: { emoji: '☀️', name: 'Normal', color: '#FFD700' },
            rain: { emoji: '🌧️', name: 'Rain', color: '#2196F3' },
            snow: { emoji: '❄️', name: 'Snow', color: '#87CEEB' },
            thunderstorm: { emoji: '⛈️', name: 'Thunderstorm', color: '#4B0082' },
            fire: { emoji: '🔥', name: 'Fire Outbreak', color: '#FF6B35' }
        };
        
        const current = weatherData[this.currentWeather] || weatherData.normal;
        
        weatherEmoji.textContent = current.emoji;
        weatherName.textContent = current.name;
        weatherName.style.color = current.color;
        
        if (this.currentWeather !== 'normal' && this.weatherDuration > 0) {
            weatherDuration.textContent = `${this.weatherDuration} min left`;
        } else {
            weatherDuration.textContent = '';
        }
    }

    startWeather(weatherType) {
        this.currentWeather = weatherType;
        this.weatherDuration = Math.floor(Math.random() * 5) + 3; // 3-7 minutes
    }

    applyRainMutations() {
        this.plots.forEach(row => {
            row.forEach(plotData => {
                if (plotData.stage === 'mature' && Math.random() < 0.55) {
                    this.applyMutation(plotData, 'wet');
                }
            });
        });
    }

    applySnowMutations() {
        this.plots.forEach(row => {
            row.forEach(plotData => {
                if (plotData.stage === 'mature') {
                    if (Math.random() < 0.055) {
                        this.applyMutation(plotData, 'frozen');
                    } else if (Math.random() < 0.2) {
                        this.applyMutation(plotData, 'chilled');
                    }
                }
            });
        });
    }

    applyThunderstormMutations() {
        this.plots.forEach(row => {
            row.forEach(plotData => {
                if (plotData.stage === 'mature') {
                    if (Math.random() < 0.02) {
                        this.applyMutation(plotData, 'stormy');
                    } else if (Math.random() < 0.15) {
                        this.applyMutation(plotData, 'shocked');
                    }
                }
            });
        });
    }

    applyFireMutations() {
        this.plots.forEach(row => {
            row.forEach(plotData => {
                if (plotData.stage === 'mature' && Math.random() < 0.015) {
                    this.applyMutation(plotData, 'burnt');
                }
            });
        });
    }

    applyMutation(plotData, mutationType) {
        if (!plotData.mutations.includes(mutationType)) {
            plotData.mutations.push(mutationType);
            this.updatePlotDisplay(plotData);
        }
    }
    
    handlePlotClick(event) {
        const plot = event.currentTarget;
        const row = parseInt(plot.dataset.row);
        const col = parseInt(plot.dataset.col);
        const plotData = this.plots[row][col];
        
        const currentTime = Date.now();
        const timeSinceLastClick = currentTime - plotData.lastClickTime;
        
        // Double tap detection (within 500ms)
        if (timeSinceLastClick < 500 && plotData.stage === 'mature') {
            this.toggleFavorite(row, col);
            return;
        }
        
        plotData.lastClickTime = currentTime;
        
        if (plotData.stage === 'empty') {
            this.plantSeed(row, col);
        } else if (plotData.stage === 'mature') {
            this.showPlantInfo(plotData);
        }
    }

    showPlantInfo(plotData) {
        // Calculate plant stats
        const plant = this.plants[plotData.plant];
        let baseSellPrice = Math.floor(Math.random() * (plant.sellMax - plant.sellMin + 1)) + plant.sellMin;
        
        // Apply mutation multipliers
        let totalMultiplier = 1;
        plotData.mutations.forEach(mutationType => {
            if (this.mutations[mutationType]) {
                totalMultiplier *= this.mutations[mutationType].multiplier;
            }
        });
        
        let sellPrice = Math.floor(baseSellPrice * totalMultiplier);
        let weight = Math.floor(Math.random() * 50) + 10; // Random weight between 10-60kg
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'plot-info-modal';
        
        // Plant display with mutations
        let displayEmoji = plant.emoji;
        if (plotData.mutations.length > 0) {
            const mutationEmojis = plotData.mutations.map(mut => this.mutations[mut].emoji).join('');
            displayEmoji = mutationEmojis + plant.emoji;
        }
        
        modal.innerHTML = `
            <div class="modal-plant-display">${displayEmoji}</div>
            <div class="modal-plant-name">${plotData.plant}</div>
            
            <div class="modal-stats">
                <div class="modal-stat">
                    <span class="modal-stat-label">Weight:</span>
                    <span class="modal-stat-value">${weight}kg</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat-label">Value:</span>
                    <span class="modal-stat-value">${sellPrice.toLocaleString()}₪</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat-label">Base Value:</span>
                    <span class="modal-stat-value">${baseSellPrice.toLocaleString()}₪</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat-label">Multiplier:</span>
                    <span class="modal-stat-value">×${totalMultiplier}</span>
                </div>
            </div>
            
            ${plotData.mutations.length > 0 ? `
                <div class="modal-mutations">
                    <h4>Mutations:</h4>
                    <div class="mutation-list">
                        ${plotData.mutations.map(mut => 
                            `<span class="mutation-tag">${this.mutations[mut].emoji} ${mut} (×${this.mutations[mut].multiplier})</span>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
            
            <button class="modal-close-btn">Close</button>
        `;
        
        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close-btn');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            document.body.removeChild(modal);
        });
        
        overlay.addEventListener('click', () => {
            document.body.removeChild(overlay);
            document.body.removeChild(modal);
        });
        
        // Add to DOM
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
    }
    
    plantSeed(row, col) {
        const plotData = this.plots[row][col];
        const plot = plotData.element;
        
        const plantCost = this.plants[this.selectedSeed].cost;
        const waterCost = this.plants[this.selectedSeed].water;
        
        if (plotData.planted || this.waterLevel < waterCost || this.money < plantCost) {
            return;
        }
        
        // Plant the seed
        plotData.planted = true;
        plotData.plant = this.selectedSeed;
        plotData.stage = 'growing';
        plotData.mutations = [];
        plotData.isFavorited = false;
        
        // Check for chakra mutation on planting
        if (Math.random() < 0.002) {
            plotData.mutations.push('chakra');
        }
        
        // Check for corrupt mutation on planting
        if (Math.random() < 0.0005) {
            plotData.mutations.push('corrupt');
        }
        
        // Check for godfruit purchase badge
        if (this.selectedSeed === 'godfruit') {
            this.updateBadgeProgress('iDidIt', 1);
        }
        
        plot.className = 'plot growing';
        plot.innerHTML = '<div class="plant">🌱</div>';
        
        // Consume resources
        this.waterLevel -= waterCost;
        this.money -= plantCost;
        this.plantCount++;
        this.updateStats();
        
        // Grow the plant
        setTimeout(() => {
            this.growPlant(row, col);
        }, this.plants[this.selectedSeed].growTime);
        
        // Save after planting
        this.saveGame();
    }
    
    growPlant(row, col) {
        const plotData = this.plots[row][col];
        const plot = plotData.element;
        
        if (!plotData.planted) return;
        
        plotData.stage = 'mature';
        
        // Apply gold/rainbow/shiny mutations on maturity
        if (Math.random() < 0.2) {
            plotData.mutations.push('gold');
        }
        if (Math.random() < 0.01) {
            plotData.mutations.push('rainbow');
        }
        if (Math.random() < 0.001) {
            plotData.mutations.push('shiny');
        }
        
        this.updatePlotDisplay(plotData);
        
        // Random chance to wither over time
        setTimeout(() => {
            if (Math.random() < 0.3 && plotData.stage === 'mature') {
                this.witherPlant(row, col);
            }
        }, 10000 + Math.random() * 15000);
    }
    
    toggleFavorite(row, col) {
        const plotData = this.plots[row][col];
        plotData.isFavorited = !plotData.isFavorited;
        this.updatePlotDisplay(plotData);
    }
    
    updatePlotDisplay(plotData) {
        const plot = plotData.element;
        
        if (plotData.stage === 'mature') {
            let emoji = this.plants[plotData.plant].emoji;
            
            // Add mutation emojis
            if (plotData.mutations.length > 0) {
                const mutationEmojis = plotData.mutations.map(mut => this.mutations[mut].emoji).join('');
                emoji = mutationEmojis + emoji;
            }
            
            let className = 'plot mature';
            if (plotData.isFavorited) {
                className += ' favorited';
            }
            
            plot.className = className;
            plot.innerHTML = `<div class="plant">${emoji}</div>`;
        }
    }
    
    witherPlant(row, col) {
        const plotData = this.plots[row][col];
        const plot = plotData.element;
        
        plotData.stage = 'withered';
        plot.className = 'plot withered';
        plot.innerHTML = '<div class="plant">🥀</div>';
        
        // Remove withered plant after some time
        setTimeout(() => {
            plotData.planted = false;
            plotData.plant = null;
            plotData.stage = 'empty';
            plotData.mutations = [];
            plotData.isFavorited = false;
            plot.className = 'plot empty';
            plot.innerHTML = '';
            this.plantCount--;
            this.updateStats();
        }, 5000);
    }
    
    waterGarden() {
        if (this.waterLevel >= 100) return;
        
        this.waterLevel = Math.min(100, this.waterLevel + 30);
        this.updateStats();
        
        // Add visual water effect
        document.querySelectorAll('.plot').forEach(plot => {
            plot.style.animation = 'none';
            setTimeout(() => {
                plot.style.animation = '';
            }, 10);
        });
        
        // Animate water button
        const waterBtn = document.getElementById('water-btn');
        waterBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            waterBtn.style.transform = '';
        }, 150);
    }
    
    sellAllMaturePlants() {
        let totalEarnings = 0;
        let soldCount = 0;
        let carrotsSold = 0;
        let rainbowSold = false;

        this.plots.forEach(row => {
            row.forEach(plotData => {
                if (plotData.stage === 'mature' && plotData.plant && !plotData.isFavorited) {
                    const plant = this.plants[plotData.plant];
                    let baseSellPrice = Math.floor(Math.random() * (plant.sellMax - plant.sellMin + 1)) + plant.sellMin;
                    
                    // Count carrots for badge
                    if (plotData.plant === 'carrot') {
                        carrotsSold++;
                    }
                    
                    // Check for rainbow mutation for badge
                    if (plotData.mutations.includes('rainbow')) {
                        rainbowSold = true;
                    }
                    
                    // Clear the plot
                    plotData.planted = false;
                    plotData.plant = null;
                    plotData.stage = 'empty';
                    plotData.mutations = [];
                    plotData.isFavorited = false;
                    plotData.element.className = 'plot empty';
                    plotData.element.innerHTML = '';
                    
                    // Calculate sell price
                    let totalMultiplier = 1;
                    plotData.mutations.forEach(mutationType => {
                        if (this.mutations[mutationType]) {
                            totalMultiplier *= this.mutations[mutationType].multiplier;
                        }
                    });
                    
                    let sellPrice = Math.floor(baseSellPrice * totalMultiplier);
                    totalEarnings += sellPrice;
                    soldCount++;
                }
            });
        });

        // Update badge progress
        if (carrotsSold > 0) {
            this.badges.carrotCaretaker.progress += carrotsSold;
            if (this.badges.carrotCaretaker.progress >= this.badges.carrotCaretaker.target && !this.badges.carrotCaretaker.earned) {
                this.badges.carrotCaretaker.earned = true;
                this.newBadgeCount++;
                this.updateBadgeButton();
                this.showBadgeNotification(this.badges.carrotCaretaker);
            }
        }
        
        if (rainbowSold) {
            this.updateBadgeProgress('ooh', 1);
        }

        if (soldCount > 0) {
            this.money += totalEarnings;
            this.plantCount -= soldCount;
            this.updateStats();
            
            // Save after selling
            this.saveGame();
            
            // Show earnings animation
            const sellBtn = document.getElementById('sell-all-btn');
            sellBtn.style.transform = 'scale(0.95)';
            sellBtn.textContent = `💰 +${totalEarnings.toLocaleString()}₪`;
            setTimeout(() => {
                sellBtn.style.transform = '';
                sellBtn.textContent = '💰 Sell All Mature Plants';
            }, 1000);
        }
    }

    resetGarden() {
        this.plots.forEach(row => {
            row.forEach(plotData => {
                plotData.planted = false;
                plotData.plant = null;
                plotData.stage = 'empty';
                plotData.mutations = [];
                plotData.isFavorited = false;
                plotData.element.className = 'plot empty';
                plotData.element.innerHTML = '';
            });
        });
        
        this.plantCount = 0;
        this.waterLevel = 100;
        this.money = 10;
        this.selectedSeed = 'carrot';
        this.currentWeather = 'normal';
        this.weatherDuration = 0;
        document.querySelector('.seed-btn.active')?.classList.remove('active');
        document.querySelector('[data-plant="carrot"]').classList.add('active');
        this.updateStats();
        
        // Clear saved game
        localStorage.removeItem('gardenSaveGame');
    }
    
    startWaterDecay() {
        setInterval(() => {
            if (this.waterLevel > 0) {
                this.waterLevel = Math.max(0, this.waterLevel - 1);
                this.updateStats();
            }
        }, 3000);
    }
    
    updateStats() {
        document.getElementById('plant-count').textContent = this.plantCount;
        document.getElementById('water-level').textContent = this.waterLevel;
        document.getElementById('money').textContent = this.money.toLocaleString();
        
        const waterBtn = document.getElementById('water-btn');
        waterBtn.disabled = this.waterLevel >= 100;

        // Update seed button availability
        document.querySelectorAll('.seed-btn').forEach(btn => {
            const plantType = btn.dataset.plant;
            const canAfford = this.money >= this.plants[plantType].cost;
            btn.disabled = !canAfford;
        });

        // Update sell button
        const sellBtn = document.getElementById('sell-all-btn');
        const hasMaturePlants = this.plots.some(row => 
            row.some(plot => plot.stage === 'mature')
        );
        sellBtn.disabled = !hasMaturePlants;
        
        // Check badges after stats update
        this.checkBadges();
    }
}

// Initialize the garden when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Garden();
});