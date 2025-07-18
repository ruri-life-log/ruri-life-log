// 瑠璃の人生ログアプリのメインJavaScript

import { db } from './firebase-config.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  orderBy, 
  query, 
  limit,
  onSnapshot,
  serverTimestamp,
  where
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

class RuriLifeLog {
  constructor() {
    this.isInitialized = false;
    this.init();
  }
  
  async init() {
    console.log('🌸 瑠璃の人生ログ初期化中...');
    
    try {
      // ローディング表示
      this.showLoading();
      
      // Firebase接続テスト
      await this.testFirebaseConnection();
      
      // リアルタイムデータ監視開始
      this.setupRealtimeListeners();
      
      // イベントリスナー設定
      this.setupEventListeners();
      
      // 初期データ読み込み
      await this.loadInitialData();
      
      // ローディング非表示
      this.hideLoading();
      
      // 初期化完了
      this.isInitialized = true;
      this.updateLastUpdated();
      
      console.log('✨ 初期化完了！');
      
    } catch (error) {
      console.error('❌ 初期化エラー:', error);
      this.hideLoading();
      this.showError('初期化に失敗しました。Firebase設定を確認してください。');
    }
  }
  
  async testFirebaseConnection() {
    try {
      const testQuery = query(collection(db, 'journal'), limit(1));
      await getDocs(testQuery);
      console.log('🔥 Firebase接続成功');
    } catch (error) {
      console.error('❌ Firebase接続エラー:', error);
      throw error;
    }
  }
  
  setupRealtimeListeners() {
    // ジャーナルエントリーのリアルタイム監視
    const journalRef = collection(db, 'journal');
    const journalQuery = query(journalRef, orderBy('createdAt', 'desc'), limit(3));
    
    onSnapshot(journalQuery, (snapshot) => {
      console.log('📝 ジャーナルデータ更新検出');
      this.updateJournalDisplay(snapshot.docs);
    }, (error) => {
      console.error('❌ ジャーナルリスナーエラー:', error);
    });
    
    // ドリームリストのリアルタイム監視
    const dreamsRef = collection(db, 'dreams');
    onSnapshot(dreamsRef, (snapshot) => {
      console.log('✨ ドリームリストデータ更新検出');
      this.updateDreamListDisplay(snapshot.docs);
    }, (error) => {
      console.error('❌ ドリームリスナーエラー:', error);
    });
    
    // 感情トラッキングのリアルタイム監視
    const emotionsRef = collection(db, 'emotions');
    const emotionsQuery = query(emotionsRef, orderBy('date', 'desc'), limit(7));
    
    onSnapshot(emotionsQuery, (snapshot) => {
      console.log('💖 感情データ更新検出');
      this.updateEmotionDisplay(snapshot.docs);
    }, (error) => {
      console.error('❌ 感情リスナーエラー:', error);
    });
  }
  
  setupEventListeners() {
    // 「追加」ボタンのイベントリスナー
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-btn')) {
        e.preventDefault();
        this.handleAddButtonClick(e.target);
      }
      
      // ドリームアイテムのクリックで達成ステータス切り替え
      if (e.target.closest('.dream-item') && !e.target.classList.contains('add-btn')) {
        this.toggleDreamStatus(e.target.closest('.dream-item'));
      }
    });
    
    // キーボードショートカット
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'j':
            e.preventDefault();
            this.addJournalEntry();
            break;
          case 'd':
            e.preventDefault();
            this.addDreamItem();
            break;
          case 'e':
            e.preventDefault();
            this.addEmotionEntry();
            break;
        }
      }
    });
  }
  
  async loadInitialData() {
    try {
      // ロードマップ進捗を更新
      await this.updateRoadmapProgress();
      
      console.log('📊 初期データ読み込み完了');
    } catch (error) {
      console.error('❌ データ読み込みエラー:', error);
    }
  }
  
  async handleAddButtonClick(button) {
    const action = button.dataset.action;
    
    // ボタンアニメーション
    this.animateButton(button);
    
    try {
      switch(action) {
        case 'journal':
          await this.addJournalEntry();
          break;
        case 'dream':
          await this.addDreamItem();
          break;
        case 'emotion':
          await this.addEmotionEntry();
          break;
        case 'monthly':
          await this.addMonthlyGoal();
          break;
        case 'travel':
          await this.addTravelEntry();
          break;
        case 'roadmap':
          await this.addRoadmapEntry();
          break;
        default:
          console.warn('未定義のアクション:', action);
      }
    } catch (error) {
      console.error('❌ データ追加エラー:', error);
      this.showError('データの追加に失敗しました。');
    }
  }
  
  animateButton(button) {
    button.style.transform = 'scale(0.95)';
    button.style.opacity = '0.8';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
      button.style.opacity = '1';
    }, 150);
  }
  
  async addJournalEntry() {
    const content = prompt('今日はどんな一日だった？✨\n\n心に浮かんだこと、感じたことを自由に書いてください：');
    if (!content || content.trim() === '') return;
    
    const entry = {
      content: content.trim(),
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
      mood: this.detectMood(content),
      tags: this.extractTags(content)
    };
    
    await addDoc(collection(db, 'journal'), entry);
    console.log('📝 ジャーナルエントリー追加完了');
    this.showSuccess('今日の記録を追加しました！');
  }
  
  async addDreamItem() {
    const dream = prompt('新しい夢や目標は何ですか？🌟\n\n具体的に書いてください：');
    if (!dream || dream.trim() === '') return;
    
    const dreamItem = {
      title: dream.trim(),
      completed: false,
      category: this.categorizeDream(dream),
      createdAt: serverTimestamp(),
      priority: 1
    };
    
    await addDoc(collection(db, 'dreams'), dreamItem);
    console.log('✨ ドリームアイテム追加完了');
    this.showSuccess('新しい夢を追加しました！');
  }
  
  async addEmotionEntry() {
    const happiness = prompt('今日の幸福度はどのくらいですか？\n\n1（とても低い）から10（とても高い）で数字を入力してください：');
    const score = parseFloat(happiness);
    
    if (isNaN(score) || score < 1 || score > 10) {
      alert('数字は1から10の範囲で入力してください。');
      return;
    }
    
    const note = prompt('今日の気分や出来事について一言どうぞ（省略可）：') || '';
    
    const emotion = {
      happiness_level: score,
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
      note: note.trim()
    };
    
    await addDoc(collection(db, 'emotions'), emotion);
    console.log('💖 感情データ追加完了');
    this.showSuccess('今日の気分を記録しました！');
  }
  
  async addMonthlyGoal() {
    const goal = prompt('今月の新しい目標は何ですか？🌱\n\nTO BEリストに追加したい内容を入力してください：');
    if (!goal || goal.trim() === '') return;
    
    const monthlyGoal = {
      title: goal.trim(),
      completed: false,
      month: new Date().toISOString().slice(0, 7), // YYYY-MM形式
      createdAt: serverTimestamp()
    };
    
    await addDoc(collection(db, 'monthly_themes'), monthlyGoal);
    console.log('🌙 月次目標追加完了');
    this.showSuccess('今月の目標を追加しました！');
  }
  
  async addTravelEntry() {
    const location = prompt('どこへ旅しましたか？🗾\n\n場所を入力してください：');
    if (!location || location.trim() === '') return;
    
    const experience = prompt('その旅での体験や感想を教えてください：');
    if (!experience || experience.trim() === '') return;
    
    const travel = {
      location: location.trim(),
      experience: experience.trim(),
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    };
    
    await addDoc(collection(db, 'travels'), travel);
    console.log('🗾 旅ログ追加完了');
    this.showSuccess('旅の記録を追加しました！');
  }
  
  async addRoadmapEntry() {
    const week = prompt('何週目の振り返りですか？🗺️\n\n週番号を入力してください（例：6）：');
    const weekNum = parseInt(week);
    
    if (isNaN(weekNum) || weekNum < 1 || weekNum > 38) {
      alert('1から38の範囲で入力してください。');
      return;
    }
    
    const reflection = prompt(`第${weekNum}週の振り返りを教えてください：\n\n・ できたこと\n・ 学んだこと\n・ 次週への課題\n\n自由に書いてください：`);
    if (!reflection || reflection.trim() === '') return;
    
    const roadmapEntry = {
      week: weekNum,
      reflection: reflection.trim(),
      completed: true,
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    };
    
    await addDoc(collection(db, 'roadmap'), roadmapEntry);
    console.log('🗺️ ロードマップ振り返り追加完了');
    this.showSuccess(`第${weekNum}週の振り返りを追加しました！`);
  }
  
  // ユーティリティ関数
  detectMood(content) {
    const positiveWords = ['嬉しい', '楽しい', '素晴らしい', '最高', '感動', 'ありがとう'];
    const negativeWords = ['悲しい', 'つらい', '疑心', '不安', 'ストレス'];
    
    for (let word of positiveWords) {
      if (content.includes(word)) return '😊';
    }
    for (let word of negativeWords) {
      if (content.includes(word)) return '😔';
    }
    return '🙂';
  }
  
  extractTags(content) {
    const tags = [];
    if (content.includes('旅')) tags.push('旅行');
    if (content.includes('仕事')) tags.push('仕事');
    if (content.includes('家族') || content.includes('家族')) tags.push('家族');
    if (content.includes('勉強') || content.includes('学習')) tags.push('学習');
    return tags;
  }
  
  categorizeDream(dream) {
    if (dream.includes('旅') || dream.includes('国')) return '旅行';
    if (dream.includes('仕事') || dream.includes('キャリア')) return 'キャリア';
    if (dream.includes('健康') || dream.includes('美容')) return '健康';
    if (dream.includes('家') || dream.includes('住')) return 'ライフスタイル';
    return 'その他';
  }
  
  updateJournalDisplay(docs) {
    const container = document.getElementById('journalEntries');
    if (!container) return;
    
    container.innerHTML = '';
    
    docs.forEach(doc => {
      const data = doc.data();
      const entry = document.createElement('div');
      entry.className = 'journal-entry';
      entry.innerHTML = `
        <div class="journal-date">${this.formatDate(data.date)}</div>
        <p>${data.content}</p>
        ${data.mood ? `<span class="mood">${data.mood}</span>` : ''}
      `;
      container.appendChild(entry);
    });
    
    if (docs.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #64748b; font-style: italic;">まだジャーナルエントリーがありません。<br>今日の記録を追加してみましょう！</p>';
    }
  }
  
  updateDreamListDisplay(docs) {
    const container = document.getElementById('dreamsList');
    if (!container) return;
    
    const totalElement = document.getElementById('totalDreams');
    const completedElement = document.getElementById('completedDreams');
    const percentageElement = document.getElementById('dreamPercentage');
    
    // 統計更新
    const total = docs.length;
    const completed = docs.filter(doc => doc.data().completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    if (totalElement) totalElement.textContent = total;
    if (completedElement) completedElement.textContent = completed;
    if (percentageElement) percentageElement.textContent = `${percentage}%`;
    
    // リスト更新
    container.innerHTML = '';
    
    docs.slice(0, 5).forEach(doc => {
      const data = doc.data();
      const item = document.createElement('div');
      item.className = `dream-item ${data.completed ? 'completed' : ''}`;
      item.dataset.id = doc.id;
      item.innerHTML = `
        <span>${this.getCategoryIcon(data.category)}</span>
        <span>${data.title}</span>
      `;
      container.appendChild(item);
    });
    
    if (docs.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #64748b; font-style: italic;">まだ夢リストがありません。<br>最初の夢を追加してみましょう！</p>';
    }
  }
  
  updateEmotionDisplay(docs) {
    const scoreElement = document.getElementById('emotionScore');
    const historyElement = document.getElementById('emotionHistory');
    
    if (!docs.length) return;
    
    // 平均幸福度計算
    const scores = docs.map(doc => doc.data().happiness_level);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    if (scoreElement) {
      scoreElement.textContent = average.toFixed(1);
    }
    
    // 過去7日間の詳細表示
    if (historyElement) {
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      const today = new Date();
      
      let historyHTML = '';
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayIndex = date.getDay();
        
        const dayData = docs.find(doc => doc.data().date === dateStr);
        const score = dayData ? dayData.data().happiness_level : '-';
        
        historyHTML += `
          <div class="emotion-day">
            <span>${days[dayIndex]}</span>
            <span>${score !== '-' ? score.toFixed(1) : score}</span>
          </div>
        `;
      }
      
      historyElement.innerHTML = historyHTML;
    }
  }
  
  async updateRoadmapProgress() {
    try {
      const roadmapQuery = query(collection(db, 'roadmap'), where('completed', '==', true));
      const snapshot = await getDocs(roadmapQuery);
      
      const completed = snapshot.size;
      const total = 38;
      const percentage = Math.round((completed / total) * 100);
      
      const progressElement = document.getElementById('roadmapProgress');
      const statusElement = document.getElementById('roadmapStatus');
      
      if (progressElement) {
        progressElement.style.width = `${percentage}%`;
      }
      
      if (statusElement) {
        statusElement.textContent = `進捗: ${completed}/${total}週間完了`;
      }
      
      console.log('🗺️ ロードマップ進捗更新完了');
    } catch (error) {
      console.error('❌ ロードマップ進捗更新エラー:', error);
    }
  }
  
  // ユーティリティ関数
  formatDate(dateStr) {
    if (!dateStr) return '日付不明';
    const date = new Date(dateStr + 'T00:00:00');
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  }
  
  getCategoryIcon(category) {
    const icons = {
      '旅行': '🌍',
      'キャリア': '💼',
      '健康': '🌱',
      'ライフスタイル': '🏠',
      'その他': '✨'
    };
    return icons[category] || '✨';
  }
  
  updateLastUpdated() {
    const element = document.getElementById('lastUpdated');
    if (element) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      element.innerHTML = `<span>最終更新: 今日 ${timeStr}</span>`;
    }
  }
  
  showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';
  }
  
  hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
  }
  
  showSuccess(message) {
    // 簡易的な成功メッセージ表示（後で改善する予定）
    console.log('✅', message);
    // 一時的にalertで代用
    setTimeout(() => alert(message), 100);
  }
  
  showError(message) {
    // 簡易的なエラーメッセージ表示（後で改善する予定）
    console.error('❌', message);
    alert(message);
  }
}

// アプリ初期化
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌸 瑠璃の人生ログアプリ起動中...');
  new RuriLifeLog();
});

// グローバルエラーハンドラー
window.addEventListener('error', (event) => {
  console.error('❌ グローバルエラー:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ 未処理のPromiseエラー:', event.reason);
  event.preventDefault();
});