document.addEventListener('DOMContentLoaded', () => {
    const seedItems = document.querySelectorAll('.seed-item');
    const gardenBed = document.getElementById('garden-bed');
    // If the main garden elements are missing (page removed), stop initialization
    if ((!seedItems || seedItems.length === 0) && !gardenBed) return;
    const growButton = document.getElementById('grow-button');
    const resetButton = document.getElementById('reset-button');
    const plantCountEl = document.getElementById('plant-count');
    const grownCountEl = document.getElementById('grown-count');

    // Remote iframe open/close controls (keeps user on same URL while showing external page)
    const openRemoteBtn = document.getElementById('open-remote');
    const remoteOverlay = document.getElementById('remote-overlay');
    const closeRemoteBtn = document.getElementById('close-remote');

    function openRemote(){ remoteOverlay.classList.add('active'); remoteOverlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
    function closeRemote(){ remoteOverlay.classList.remove('active'); remoteOverlay.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }

    openRemoteBtn.addEventListener('click', openRemote);
    closeRemoteBtn.addEventListener('click', closeRemote);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeRemote(); });

    let selectedSeedType = null;
    const plantedItems = []; // Stores { element: HTMLElement, seedType: string, isGrown: boolean }

    const plantToImageMap = {
        carrot: { seed: 'carrot_seed.png', plant: 'carrot_plant.png' },
        tomato: { seed: 'tomato_seed.png', plant: 'tomato_plant.png' },
        flower: { seed: 'flower_seed.png', plant: 'flower_plant.png' },
    };

    // Particle system
    function createParticles() {
        const container = document.getElementById('particle-container');
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (4 + Math.random() * 4) + 's';
            container.appendChild(particle);
        }
    }

    // Update stats
    function updateStats() {
        plantCountEl.textContent = plantedItems.length;
        grownCountEl.textContent = plantedItems.filter(item => item.isGrown).length;
    }

    // Update grow button
    function updateGrowButtonState() {
        const hasUngrown = plantedItems.some(item => !item.isGrown);
        growButton.disabled = plantedItems.length === 0 || !hasUngrown;
    }

    // Seed selection logic
    seedItems.forEach(seedItem => {
        seedItem.addEventListener('click', () => {
            // Remove 'selected' class from all seeds
            seedItems.forEach(item => item.classList.remove('selected'));

            // Add 'selected' class to the clicked seed
            seedItem.classList.add('selected');
            selectedSeedType = seedItem.dataset.seedType;
        });
    });

    // Planting logic
    gardenBed.addEventListener('click', (event) => {
        if (selectedSeedType) {
            // Check if the click was directly on the garden bed, not on an existing plant
            if (event.target === gardenBed) {
                const gardenRect = gardenBed.getBoundingClientRect();
                
                const plantedItemDiv = document.createElement('div');
                plantedItemDiv.className = 'planted-item';
                plantedItemDiv.dataset.seedType = selectedSeedType;
                plantedItemDiv.dataset.isGrown = 'false';

                const img = document.createElement('img');
                img.src = plantToImageMap[selectedSeedType].seed;
                img.alt = `${selectedSeedType} Seed`;
                plantedItemDiv.appendChild(img);

                const clickX = event.clientX - gardenRect.left;
                const clickY = event.clientY - gardenRect.top;
                const plantSize = 90;

                const x = Math.max(0, Math.min(gardenRect.width - plantSize, clickX - plantSize/2));
                const y = Math.max(0, Math.min(gardenRect.height - plantSize, clickY - plantSize/2));

                plantedItemDiv.style.left = x + 'px';
                plantedItemDiv.style.top = y + 'px';
                plantedItemDiv.style.zIndex = plantedItems.length;

                gardenBed.appendChild(plantedItemDiv);
                plantedItems.push({ element: plantedItemDiv, seedType: selectedSeedType, isGrown: false });

                // Add planting animation
                plantedItemDiv.style.transform = 'scale(0)';
                requestAnimationFrame(() => {
                    plantedItemDiv.style.transition = 'transform 0.3s ease';
                    plantedItemDiv.style.transform = 'scale(1)';
                });

                // Deselect seed after planting
                seedItems.forEach(item => item.classList.remove('selected'));
                selectedSeedType = null;
                updateGrowButtonState();
                updateStats();
            }
        }
    });

    // Drag functionality
    let activeItem = null;
    let offsetX = 0, offsetY = 0;

    function handleDragStart(e) {
        const plantedItem = e.target.closest('.planted-item');
        if (!plantedItem) return;

        activeItem = plantedItem;
        const rect = activeItem.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;
        
        activeItem.style.cursor = 'grabbing';
        e.preventDefault();
    }

    function handleDrag(e) {
        if (!activeItem) return;
        
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        const gardenRect = gardenBed.getBoundingClientRect();
        const plantSize = 90;
        
        let x = clientX - gardenRect.left - offsetX;
        let y = clientY - gardenRect.top - offsetY;
        
        x = Math.max(0, Math.min(gardenRect.width - plantSize, x));
        y = Math.max(0, Math.min(gardenRect.height - plantSize, y));
        
        activeItem.style.left = x + 'px';
        activeItem.style.top = y + 'px';
        
        e.preventDefault();
    }

    function handleDragEnd() {
        if (activeItem) {
            activeItem.style.cursor = 'grab';
            activeItem = null;
        }
    }

    // Mouse events
    gardenBed.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);

    // Touch events
    gardenBed.addEventListener('touchstart', handleDragStart, { passive: false });
    document.addEventListener('touchmove', handleDrag, { passive: false });
    document.addEventListener('touchend', handleDragEnd);

    // Grow button logic
    growButton.addEventListener('click', () => {
        let hasGrown = false;
        plantedItems.forEach(item => {
            if (!item.isGrown) {
                const img = item.element.querySelector('img');
                img.src = plantToImageMap[item.seedType].plant;
                item.isGrown = true;
                item.element.dataset.isGrown = 'true';
                item.element.classList.add('grown');
                hasGrown = true;
            }
        });
        
        if (hasGrown) {
            // Create growth particles
            for (let i = 0; i < 10; i++) {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.width = '6px';
                particle.style.height = '6px';
                particle.style.background = '#4CAF50';
                particle.style.borderRadius = '50%';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animation = 'float 2s ease-out forwards';
                gardenBed.appendChild(particle);
                
                setTimeout(() => particle.remove(), 2000);
            }
        }
        
        updateGrowButtonState();
        updateStats();
    });

    // Reset button logic
    resetButton.addEventListener('click', () => {
        plantedItems.forEach(item => {
            item.element.style.transform = 'scale(0)';
            setTimeout(() => item.element.remove(), 300);
        });
        plantedItems.length = 0;
        updateGrowButtonState();
        updateStats();
    });

    // Initialize
    createParticles();
    updateGrowButtonState();
    updateStats();
});