// 🌸 瑠璃の人生ログサイト - メインアプリケーション
// モバイルボヘミアン実現への旅路をサポート

// ==========================================================
// グローバル変数とユーティリティ
// ==========================================================

let currentTab = 'dashboard';
let currentDreamCategory = 'all';
let selectedMood = null;

// 日付フォーマット関数
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });
}

// 相対日付フォーマット
function formatRelativeDate(date) {
    if (!date) return '';
    const now = new Date();
    const targetDate = new Date(date);
    const diffTime = now - targetDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    return formatDate(date);
}

// エラーハンドリング
function handleError(error, context = '') {
    console.error(`❌ エラー ${context}:`, error);
    showNotification(`エラーが発生しました: ${error.message}`, 'error');
}

// 通知表示
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// アニメーションCSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ==========================================================
// タブナビゲーション
// ==========================================================

function initTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    // ナビゲーションボタンの更新
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // タブコンテンツの表示切り替え
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    
    currentTab = tabId;
    
    // タブ切り替え時にデータを更新
    switch(tabId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'journal':
            loadJournalEntries();
            break;
        case 'dreams':
            loadDreams();
            break;
        case 'roadmap':
            loadRoadmap();
            break;
        case 'emotions':
            loadEmotions();
            break;
        case 'travels':
            loadTravels();
            break;
    }
}

// ==========================================================
// ダッシュボード機能
// ==========================================================

async function updateDashboard() {
    try {
        // 全体進捗計算
        await updateOverallProgress();
        
        // 今週のロードマップ
        await updateCurrentWeek();
        
        // ドリーム達成数
        await updateDreamsCount();
        
        // 最新ジャーナル
        await updateLatestJournal();
        
        // 感情グラフ
        await updateEmotionChart();
        
        // 月次テーマ
        updateMonthlyTheme();
        
    } catch (error) {
        handleError(error, 'ダッシュボード更新');
    }
}

async function updateOverallProgress() {
    try {
        const completedWeeks = await collections.roadmap()
            .where('completed', '==', true)
            .get();
        
        const progress = Math.round((completedWeeks.size / 38) * 100);
        document.getElementById('overall-progress').textContent = `${progress}%`;
    } catch (error) {
        console.error('進捗更新エラー:', error);
    }
}

async function updateCurrentWeek() {
    try {
        const currentWeekSnapshot = await collections.roadmap()
            .where('week', '<=', getCurrentWeekNumber())
            .orderBy('week', 'desc')
            .limit(1)
            .get();
        
        if (!currentWeekSnapshot.empty) {
            const weekData = currentWeekSnapshot.docs[0].data();
            document.querySelector('.week-number').textContent = `Week ${weekData.week}`;
            document.querySelector('.week-content').textContent = weekData.content;
        }
    } catch (error) {
        console.error('今週のロードマップ更新エラー:', error);
    }
}

async function updateDreamsCount() {
    try {
        const completedDreams = await collections.dreams()
            .where('completed', '==', true)
            .get();
        
        document.getElementById('dreams-completed').textContent = completedDreams.size;
    } catch (error) {
        console.error('ドリーム数更新エラー:', error);
    }
}

async function updateLatestJournal() {
    try {
        const latestJournal = await collections.journal()
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();
        
        const container = document.getElementById('latest-journal');
        
        if (!latestJournal.empty) {
            const journal = latestJournal.docs[0].data();
            container.innerHTML = `
                <div class="journal-preview-date">${formatRelativeDate(journal.date)}</div>
                <div class="journal-preview-content">${journal.content.substring(0, 100)}${journal.content.length > 100 ? '...' : ''}</div>
                <div class="journal-preview-meta">
                    <span>${journal.mood || '😊'}</span>
                    ${journal.tags ? journal.tags.map(tag => `<span class="tag">#${tag}</span>`).join('') : ''}
                </div>
            `;
        } else {
            container.innerHTML = '<p class="no-data">まだジャーナルがありません</p>';
        }
    } catch (error) {
        console.error('最新ジャーナル更新エラー:', error);
    }
}

async function updateEmotionChart() {
    try {
        const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
        const emotions = await collections.emotions()
            .where('date', '>=', thisMonth + '-01')
            .where('date', '<=', thisMonth + '-31')
            .orderBy('date')
            .get();
        
        const container = document.getElementById('emotion-chart');
        
        if (!emotions.empty) {
            const chartData = emotions.docs.map(doc => {
                const data = doc.data();
                return {
                    date: data.date,
                    happiness: data.happiness_level
                };
            });
            
            renderEmotionChart(container, chartData);
        } else {
            container.innerHTML = '<p class="no-data">今月の記録がありません</p>';
        }
    } catch (error) {
        console.error('感情チャート更新エラー:', error);
    }
}

function renderEmotionChart(container, data) {
    // シンプルな折れ線グラフを描画
    const maxHappiness = 10;
    const chartHeight = 150;
    const chartWidth = 300;
    
    let chartHTML = `
        <div class="simple-chart" style="position: relative; width: 100%; height: ${chartHeight}px; margin: 20px 0;">
            <div class="chart-line" style="position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: #e5e7eb;"></div>
    `;
    
    data.forEach((point, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = ((maxHappiness - point.happiness) / maxHappiness) * 100;
        
        chartHTML += `
            <div class="chart-point" style="
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                width: 8px;
                height: 8px;
                background: #667eea;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            " title="${point.date}: ${point.happiness}/10"></div>
        `;
    });
    
    chartHTML += '</div>';
    container.innerHTML = chartHTML;
}

function updateMonthlyTheme() {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const themes = {
        '2025-07': '日常生活を丁寧に送り、自分を守る',
        '2025-08': 'パーソナルタイムを増やし、アーティスト性を発揮する',
        '2025-09': '発信を通じて価値観を整理し、同じ思いの人とつながる'
    };
    
    const themeText = themes[currentMonth] || '今月のテーマを設定しましょう';
    document.querySelector('.theme-text').textContent = themeText;
}

function getCurrentWeekNumber() {
    const startDate = new Date('2025-07-07'); // Week 1開始日
    const currentDate = new Date();
    const diffTime = currentDate - startDate;
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    return Math.min(Math.max(diffWeeks + 1, 1), 38);
}

// ==========================================================
// ジャーナリング機能
// ==========================================================

function initJournalFeatures() {
    const addBtn = document.getElementById('add-journal-btn');
    const form = document.getElementById('journal-form');
    const formElement = document.getElementById('journal-entry-form');
    const cancelBtn = document.getElementById('cancel-journal');
    const moodButtons = document.querySelectorAll('.mood-btn');
    
    // フォーム表示
    addBtn.addEventListener('click', () => {
        form.classList.remove('hidden');
        document.getElementById('journal-content').focus();
    });
    
    // フォーム非表示
    cancelBtn.addEventListener('click', () => {
        form.classList.add('hidden');
        formElement.reset();
        selectedMood = null;
        updateMoodButtons();
    });
    
    // フォーム外クリックで閉じる
    form.addEventListener('click', (e) => {
        if (e.target === form) {
            cancelBtn.click();
        }
    });
    
    // ムード選択
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedMood = btn.getAttribute('data-mood');
            updateMoodButtons();
        });
    });
    
    // フォーム送信
    formElement.addEventListener('submit', handleJournalSubmit);
}

function updateMoodButtons() {
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.getAttribute('data-mood') === selectedMood);
    });
}

async function handleJournalSubmit(e) {
    e.preventDefault();
    
    const content = document.getElementById('journal-content').value.trim();
    const tags = document.getElementById('journal-tags').value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
    
    if (!content) {
        showNotification('内容を入力してください', 'error');
        return;
    }
    
    try {
        await collections.journal().add({
            content: content,
            mood: selectedMood || '😊',
            tags: tags,
            date: now(),
            createdAt: timestamp()
        });
        
        showNotification('ジャーナルを保存しました！');
        document.getElementById('cancel-journal').click();
        loadJournalEntries();
        
    } catch (error) {
        handleError(error, 'ジャーナル保存');
    }
}

async function loadJournalEntries() {
    try {
        const snapshot = await collections.journal()
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();
        
        const container = document.getElementById('journal-list');
        
        if (snapshot.empty) {
            container.innerHTML = '<p class="no-data">まだジャーナルエントリーがありません。最初の記録を書いてみましょう！</p>';
            return;
        }
        
        const entriesHTML = snapshot.docs.map(doc => {
            const journal = doc.data();
            return `
                <div class="journal-item">
                    <div class="journal-item-date">${formatRelativeDate(journal.date)}</div>
                    <div class="journal-item-content">${journal.content}</div>
                    <div class="journal-item-meta">
                        <span class="mood">${journal.mood}</span>
                        ${journal.tags ? journal.tags.map(tag => `<span class="tag">#${tag}</span>`).join('') : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = entriesHTML;
        
    } catch (error) {
        handleError(error, 'ジャーナル読み込み');
    }
}

// ==========================================================
// ドリームリスト機能
// ==========================================================

function initDreamFeatures() {
    const addBtn = document.getElementById('add-dream-btn');
    const form = document.getElementById('dream-form');
    const formElement = document.getElementById('dream-entry-form');
    const cancelBtn = document.getElementById('cancel-dream');
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    // フォーム表示
    addBtn.addEventListener('click', () => {
        form.classList.remove('hidden');
        document.getElementById('dream-title').focus();
    });
    
    // フォーム非表示
    cancelBtn.addEventListener('click', () => {
        form.classList.add('hidden');
        formElement.reset();
    });
    
    // フォーム外クリックで閉じる
    form.addEventListener('click', (e) => {
        if (e.target === form) {
            cancelBtn.click();
        }
    });
    
    // カテゴリフィルター
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentDreamCategory = btn.getAttribute('data-category');
            updateCategoryButtons();
            loadDreams();
        });
    });
    
    // フォーム送信
    formElement.addEventListener('submit', handleDreamSubmit);
}

function updateCategoryButtons() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === currentDreamCategory);
    });
}

async function handleDreamSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('dream-title').value.trim();
    const category = document.getElementById('dream-category').value;
    const priority = parseInt(document.getElementById('dream-priority').value);
    
    if (!title || !category) {
        showNotification('タイトルとカテゴリーを入力してください', 'error');
        return;
    }
    
    try {
        await collections.dreams().add({
            title: title,
            category: category,
            priority: priority,
            completed: false,
            createdAt: timestamp()
        });
        
        showNotification('新しい夢を追加しました！');
        document.getElementById('cancel-dream').click();
        loadDreams();
        
    } catch (error) {
        handleError(error, 'ドリーム追加');
    }
}

async function loadDreams() {
    try {
        let query = collections.dreams().orderBy('priority').orderBy('createdAt', 'desc');
        
        if (currentDreamCategory !== 'all') {
            query = query.where('category', '==', currentDreamCategory);
        }
        
        const snapshot = await query.get();
        
        const container = document.getElementById('dreams-list');
        
        if (snapshot.empty) {
            container.innerHTML = '<p class="no-data">このカテゴリーにはまだ夢がありません。新しい夢を追加してみましょう！</p>';
            return;
        }
        
        const dreamsHTML = snapshot.docs.map(doc => {
            const dream = doc.data();
            const priorityText = ['', '高', '中', '低'][dream.priority] || '中';
            
            return `
                <div class="dream-item ${dream.completed ? 'dream-completed' : ''}">
                    <div class="dream-item-title">${dream.title}</div>
                    <div class="dream-item-meta">
                        <span class="dream-category">${dream.category}</span>
                        <span class="dream-priority">優先度: ${priorityText}</span>
                        <button class="toggle-dream-btn" data-id="${doc.id}" data-completed="${dream.completed}">
                            ${dream.completed ? '未完了にする' : '完了にする'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = dreamsHTML;
        
        // 完了/未完了ボタンのイベントリスナー
        document.querySelectorAll('.toggle-dream-btn').forEach(btn => {
            btn.addEventListener('click', toggleDreamCompletion);
        });
        
    } catch (error) {
        handleError(error, 'ドリーム読み込み');
    }
}

async function toggleDreamCompletion(e) {
    const dreamId = e.target.getAttribute('data-id');
    const isCompleted = e.target.getAttribute('data-completed') === 'true';
    
    try {
        await collections.dreams().doc(dreamId).update({
            completed: !isCompleted
        });
        
        showNotification(isCompleted ? '夢を未完了にしました' : '夢を完了にしました！🎉');
        loadDreams();
        
    } catch (error) {
        handleError(error, 'ドリーム更新');
    }
}

// ==========================================================
// DOMコンテンツ読み込み完了時の初期化
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌸 瑠璃の人生ログサイト 起動中...');
    
    // 基本機能の初期化
    initTabNavigation();
    initJournalFeatures();
    initDreamFeatures();
    
    // 初期データ読み込み
    updateDashboard();
    
    console.log('✨ アプリケーション初期化完了！');
});

// フローティングアクションボタン
document.addEventListener('DOMContentLoaded', () => {
    const fabOptions = document.querySelectorAll('.fab-option');
    
    fabOptions.forEach(option => {
        option.addEventListener('click', () => {
            const action = option.getAttribute('data-action');
            
            switch(action) {
                case 'journal':
                    switchTab('journal');
                    setTimeout(() => document.getElementById('add-journal-btn').click(), 100);
                    break;
                case 'emotion':
                    switchTab('emotions');
                    setTimeout(() => document.getElementById('add-emotion-btn').click(), 100);
                    break;
                case 'dream':
                    switchTab('dreams');
                    setTimeout(() => document.getElementById('add-dream-btn').click(), 100);
                    break;
            }
        });
    });
});

// キーボードショートカット
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'j':
                e.preventDefault();
                document.getElementById('add-journal-btn').click();
                break;
            case 'd':
                e.preventDefault();
                document.getElementById('add-dream-btn').click();
                break;
            case 'e':
                e.preventDefault();
                if (document.getElementById('add-emotion-btn')) {
                    document.getElementById('add-emotion-btn').click();
                }
                break;
        }
    }
});

console.log('🚀 瑠璃の人生ログサイト準備完了！モバイルボヘミアンへの旅路が始まります✨');