// 初始化数据
let locations = [
    {
        name: "第一教学楼",
        type: "teaching",
        coord: [30.538, 114.360],
        openTime: { start: "08:00", end: "22:00" },
        crowdLevel: "medium",
        info: "开放时间：08:00-22:00\n主要设施：多媒体教室、教师办公室"
    },
    {
        name: "学生食堂",
        type: "dining",
        coord: [30.537, 114.361],
        openTime: { start: "06:30", end: "20:30" },
        crowdLevel: "high",
        info: "开放时间：06:30-20:30\n可容纳人数：2000人"
    }
];

// 用户面板功能
const initUserPanel = () => {
    const userInfo = document.getElementById('userInfo');
    const dropdownMenu = document.getElementById('dropdownMenu');

    userInfo.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show-dropdown');
    });

    document.addEventListener('click', () => {
        dropdownMenu.classList.remove('show-dropdown');
    });

    dropdownMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
};

// 地图初始化
const initMap = () => {
    const map = L.map('campus-map', {
        center: [30.53786, 114.35986],
        zoom: 16,
        zoomControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);
    return map;
};

// 搜索功能
const initSearch = (map) => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const suggestionsBox = document.getElementById('searchSuggestions');
    let currentHighlight = null;

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };

    const showSuggestions = (results) => {
        suggestionsBox.innerHTML = results.map(loc => `
            <div class="suggestion-item" data-coord="${loc.coord}">
                ${loc.name}
                <small>${loc.type}</small>
            </div>
        `).join('');
        suggestionsBox.style.display = results.length ? 'block' : 'none';
    };

    const performSearch = (keyword) => {
        const results = locations.filter(loc =>
            loc.name.toLowerCase().includes(keyword.toLowerCase()) ||
            loc.type.toLowerCase().includes(keyword.toLowerCase())
        );

        if (results.length > 0) {
            const target = results[0];
            map.flyTo(target.coord, 18);
            if (currentHighlight) currentHighlight.remove();
            currentHighlight = L.marker(target.coord).addTo(map);
            setTimeout(() => currentHighlight.remove(), 3000);
        }
    };

    searchInput.addEventListener('input', debounce(e => {
        const keyword = e.target.value.trim();
        const results = keyword ? locations.filter(loc => 
            loc.name.toLowerCase().includes(keyword.toLowerCase())
        ) : [];
        showSuggestions(results);
    }, 300));

    searchButton.addEventListener('click', () => {
        const keyword = searchInput.value.trim();
        if (keyword) performSearch(keyword);
    });

    suggestionsBox.addEventListener('click', e => {
        const item = e.target.closest('.suggestion-item');
        if (item) {
            searchInput.value = item.textContent.trim();
            suggestionsBox.style.display = 'none';
            const coord = item.dataset.coord.split(',').map(Number);
            map.flyTo(coord, 18);
        }
    });
};

// 筛选功能
const initFilters = (map) => {
    const typeFilters = document.querySelectorAll('#typeFilters .filter-btn');
    const timeFilter = document.getElementById('timeFilter');
    const crowdFilter = document.getElementById('crowdFilter');

    let currentType = 'all';
    let currentTime = 'all';
    let currentCrowd = 'all';

    const updateMarkers = () => {
        locations.forEach(loc => {
            const visible = checkVisibility(loc);
            loc.marker.setOpacity(visible ? 1 : 0);
            loc.marker[visible ? 'addTo' : 'removeFrom'](map);
        });
    };

    const checkVisibility = (loc) => {
        // 类型筛选
        if (currentType !== 'all' && loc.type !== currentType) return false;
        
        // 时间筛选
        if (currentTime !== 'all') {
            const now = new Date();
            const [startH, startM] = loc.openTime.start.split(':').map(Number);
            const [endH, endM] = loc.openTime.end.split(':').map(Number);
            const startTime = new Date().setHours(startH, startM);
            const endTime = new Date().setHours(endH, endM);
            
            if (currentTime === 'open' && (now < startTime || now > endTime)) return false;
            if (currentTime === 'morning' && (startH > 9 || endH < 12)) return false;
        }

        // 人流量筛选
        if (currentCrowd !== 'all' && loc.crowdLevel !== currentCrowd) return false;

        return true;
    };

    typeFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            typeFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentType = btn.dataset.type;
            updateMarkers();
        });
    });

    timeFilter.addEventListener('change', (e) => {
        currentTime = e.target.value;
        updateMarkers();
    });

    crowdFilter.addEventListener('change', (e) => {
        currentCrowd = e.target.value;
        updateMarkers();
    });
};

// 初始化函数
document.addEventListener('DOMContentLoaded', () => {
    initUserPanel();
    const map = initMap();
    
    // 为地点添加标记
    locations.forEach(loc => {
        loc.marker = L.marker(loc.coord)
            .bindPopup(`<b>${loc.name}</b><br>${loc.info.replace(/\n/g, '<br>')}`)
            .addTo(map);
    });

    initSearch(map);
    initFilters(map);
});
// 景点数据
const attractions = {
    library: {
        title: "求是图书馆",
        images: ["lib1.jpg", "lib2.jpg"],
        content: `<p>建成于2010年，建筑面积10万平方米...特色服务：</p>
            <ul>
                <li>24小时自习区</li>
                <li>古籍文献阅览室</li>
                <li>VR历史体验区</li>
            </ul>
`
    },
    stadium: {
        title: "综合体育场",
        images: ["stadium1.jpg", "stadium2.jpg"],
        content: `体育场详细介绍内容...`
    },
    cafeteria: {
        title: "学生食堂",
        images: ["cafeteria1.jpg", "cafeteria2.jpg"],
        content: `食堂详细介绍内容...`
    },
    clinic: {
        title: "校医院",
        images: ["clinic1.jpg"],
        content: `医务室详细介绍内容...`
    },
    counseling: {
        title: "心理咨询中心",
        images: ["counseling1.jpg"],
        content: `心理咨询室详细介绍内容...`
    }
};

// 初始化信息介绍区
// 修改初始化函数
const initInfoSection = () => {
    // 主轮播逻辑
    const mainCarousel = document.querySelector('.main-carousel');
    const mainTrack = mainCarousel.querySelector('.main-track');
    const slides = [];
    let currentMainIndex = 0;

    // 生成主轮播内容
    Object.entries(attractions).forEach(([key, attraction]) => {
        const slide = document.createElement('div');
        slide.className = 'main-slide';
        slide.innerHTML = `
            <div class="attraction-card">
                <div class="image-container">
                    <img src="${attraction.images[0]}" alt="${attraction.title}">
                </div>
                <h3>${attraction.title}</h3>
                <button class="detail-btn" data-target="${key}">查看详情</button>
            </div>
        `;
        mainTrack.appendChild(slide);
        slides.push(slide);
    });

    // 主轮播导航
    document.querySelector('.main-prev').addEventListener('click', () => {
        currentMainIndex = (currentMainIndex - 1 + slides.length) % slides.length;
        mainTrack.style.transform = `translateX(-${currentMainIndex * 100}%)`;
    });

    document.querySelector('.main-next').addEventListener('click', () => {
        currentMainIndex = (currentMainIndex + 1) % slides.length;
        mainTrack.style.transform = `translateX(-${currentMainIndex * 100}%)`;
    });

    // 模态框关闭问题修复
    const modal = document.getElementById('attraction-modal');
    
    // 正确绑定关闭事件
    document.querySelector('.close-btn').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // 修复动态生成的详情按钮事件绑定
    mainTrack.addEventListener('click', (e) => {
        if(e.target.classList.contains('detail-btn')) {
            const data = attractions[e.target.dataset.target];
            document.getElementById('modal-content').innerHTML = `
                <h2>${data.title}</h2>
                ${data.content}
            `;
            modal.style.display = 'block';
        }
    });
};

// 在DOMContentLoaded事件中调用
document.addEventListener('DOMContentLoaded', () => {
    // 原有初始化代码...
    initInfoSection();
});// 新增路由相关变量
let routePanel = document.getElementById('routePanel');
let routingControl = null;

// 初始化路线规划功能
const initRouting = (map) => {
    // 初始化自动完成
    const datalist = document.getElementById('locationList');
    datalist.innerHTML = locations.map(loc => 
        `<option value="${loc.name}">${loc.name}</option>`
    ).join('');

    // 模式切换
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.mode-btn').forEach(b => 
                b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 规划路线
    document.getElementById('startNavigation').addEventListener('click', async () => {
        const start = document.getElementById('startInput').value;
        const end = document.getElementById('endInput').value;
        const mode = document.querySelector('.mode-btn.active').dataset.mode;

        if(!start || !end) {
            alert('请填写起点和终点');
            return;
        }

        try {
            // 获取坐标（需替换为真实地理编码）
            const startLoc = locations.find(l => l.name === start);
            const endLoc = locations.find(l => l.name === end);
            
            if(!startLoc || !endLoc) throw new Error('找不到指定地点');

            // 清除旧路线
            if(routingControl) {
                map.removeControl(routingControl);
            }

            // 使用Leaflet Routing Machine
            routingControl = L.Routing.control({
                waypoints: [
                    L.latLng(startLoc.coord),
                    L.latLng(endLoc.coord)
                ],
                routeWhileDragging: true,
                show: false,
                router: L.Routing.osrmv1({
                    serviceUrl: 'https://router.project-osrm.org/route/v1',
                    profile: mode === 'driving' ? 'car' : mode
                })
            }).addTo(map);

            // 监听路线规划完成
            routingControl.on('routesfound', function(e) {
                const route = e.routes[0];
                document.getElementById('distanceValue').textContent = 
                    `${(route.summary.totalDistance / 1000).toFixed(1)}公里`;
                document.getElementById('durationValue').textContent = 
                    `${Math.round(route.summary.totalTime / 60)}分钟`;
                
                // 显示步骤指引
                const stepsContainer = document.getElementById('routeSteps');
                stepsContainer.innerHTML = route.instructions.map(inst => `
                    <div class="step-item">${inst.text}</div>
                `).join('');
            });

            // 显示面板
            routePanel.classList.add('active');

        } catch (error) {
            alert(`路线规划失败: ${error.message}`);
        }
    });

    // 关闭面板
    document.getElementById('closeRoutePanel').addEventListener('click', () => {
        routePanel.classList.remove('active');
        if(routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }
    });
};

// 在初始化函数中调用
document.addEventListener('DOMContentLoaded', () => {
    const map = initMap();
    // 其他初始化...
    initRouting(map);
});
// 增强版JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 标签页切换功能
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有激活状态
            document.querySelectorAll('.tab-btn, .tab-content').forEach(el => {
                el.classList.remove('active');
            });

            // 设置当前激活状态
            this.classList.add('active');
            const targetTab = document.getElementById(this.dataset.tab);
            if(targetTab) targetTab.classList.add('active');

            // 重置所有展开状态
            resetExpansion();
        });
    });

    // 展开/收起功能
    document.querySelectorAll('.text-content').forEach(container => {
        const btn = container.querySelector('.expand-btn');
        const collapsible = container.querySelector('.collapsible');

        btn?.addEventListener('click', function() {
            collapsible.classList.toggle('expanded');
            this.classList.toggle('expanded');
            this.textContent = collapsible.classList.contains('expanded') 
                ? '收起内容 ▲' 
                : '展开全部 ▼';
        });
    });

    // 自动隐藏不需要展开的按钮
    function autoHideExpandButtons() {
        document.querySelectorAll('.collapsible').forEach(el => {
            const btn = el.nextElementSibling;
            if(el.scrollHeight <= el.clientHeight) {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'inline-block';
            }
        });
    }

    // 重置展开状态
    function resetExpansion() {
        document.querySelectorAll('.collapsible, .expand-btn').forEach(el => {
            el.classList.remove('expanded');
        });
        autoHideExpandButtons();
    }

    // 初始化执行
    autoHideExpandButtons();
    
    // 窗口大小变化时重新检测
    window.addEventListener('resize', autoHideExpandButtons);
});