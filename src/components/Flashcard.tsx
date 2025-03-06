import React, { useState, useEffect } from 'react';
import '../styles/Flashcard.css';

interface Word {
  word: string;
  meaning: string;
  example: string;
}

// Fisher-Yates 洗牌算法
const shuffleArray = (array: Word[]): Word[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Flashcard: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [difficultWords, setDifficultWords] = useState<Word[]>([]);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    fetch('./oxford3000.json')
      .then(response => response.json())
      .then(data => {
        // 过滤掉没有正确获取到释义的单词
        const validWords = data.filter((word: Word) => 
          word.meaning !== "Error fetching definition" && 
          word.example !== "Error fetching example"
        );
        // 随机打乱单词顺序
        const shuffledWords = shuffleArray(validWords);
        setWords(shuffledWords);
      })
      .catch(error => console.error('Error loading words:', error));
  }, []);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    setWordCount(prev => prev + 1);
  };

  const handleMarkDifficult = () => {
    const currentWord = words[currentIndex];
    if (!difficultWords.some(w => w.word === currentWord.word)) {
      setDifficultWords([...difficultWords, currentWord]);
    }
  };

  const handleSaveDifficultWords = () => {
    const content = JSON.stringify(difficultWords, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'difficult_words.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 添加重新打乱功能
  const handleReshuffle = () => {
    setWords(shuffleArray(words));
    setCurrentIndex(0);
    setIsFlipped(false);
    setWordCount(0);
  };

  if (words.length === 0) return <div>Loading...</div>;

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length * 100).toFixed(1);

  return (
    <div className="flashcard-container">
      <div className="progress-info">
        <span>已学习: {wordCount} 个单词</span>
        <span>当前进度: {progress}%</span>
        <span>总词数: {words.length}</span>
      </div>
      
      <div className="flashcard" onClick={handleFlip}>
        {!isFlipped ? (
          <div className="front">
            <h1>{currentWord.word}</h1>
          </div>
        ) : (
          <div className="back">
            <p className="meaning">{currentWord.meaning}</p>
            <p className="example">{currentWord.example}</p>
          </div>
        )}
      </div>
      
      <div className="controls">
        <button onClick={handleMarkDifficult}>标记为不熟</button>
        <button onClick={handleNext}>下一个</button>
        <button onClick={handleSaveDifficultWords}>保存不熟单词</button>
        <button onClick={handleReshuffle}>重新打乱</button>
      </div>

      <div className="difficult-words">
        <h2>不熟单词列表：</h2>
        <ul>
          {difficultWords.map((word, index) => (
            <li key={index}>{word.word}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Flashcard; 