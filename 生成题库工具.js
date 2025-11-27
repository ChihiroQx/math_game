/**
 * 题库生成工具
 * 运行方式：node 生成题库工具.js
 */

const fs = require('fs');

// 生成题库
function generateQuestionBank() {
  const questions = [];
  let id = 1;
  
  // 1. 10以内加法（30道）
  console.log('生成10以内加法...');
  for (let i = 1; i <= 10; i++) {
    for (let j = 1; j <= 10 - i; j++) {
      if (questions.length < 30) {
        questions.push({
          id: id++,
          type: 'addition',
          difficulty: 1,
          questionText: `${i} + ${j} = ?`,
          num1: i,
          num2: j,
          correctAnswer: i + j,
          wrongAnswers: generateWrongAnswers(i + j, 3, 10)
        });
      }
    }
  }
  
  // 2. 10以内减法（30道）
  console.log('生成10以内减法...');
  for (let i = 10; i >= 1; i--) {
    for (let j = 1; j < i; j++) {
      if (id <= 60) {
        questions.push({
          id: id++,
          type: 'subtraction',
          difficulty: 1,
          questionText: `${i} - ${j} = ?`,
          num1: i,
          num2: j,
          correctAnswer: i - j,
          wrongAnswers: generateWrongAnswers(i - j, 3, 10)
        });
      }
    }
  }
  
  // 3. 20以内加法（30道）
  console.log('生成20以内加法...');
  for (let i = 5; i <= 15; i++) {
    for (let j = 5; j <= 20 - i; j++) {
      if (id <= 90) {
        questions.push({
          id: id++,
          type: 'addition',
          difficulty: 2,
          questionText: `${i} + ${j} = ?`,
          num1: i,
          num2: j,
          correctAnswer: i + j,
          wrongAnswers: generateWrongAnswers(i + j, 3, 20)
        });
      }
    }
  }
  
  // 4. 20以内减法（30道）
  console.log('生成20以内减法...');
  for (let i = 20; i >= 10; i--) {
    for (let j = 1; j <= i - 5; j++) {
      if (id <= 120) {
        questions.push({
          id: id++,
          type: 'subtraction',
          difficulty: 2,
          questionText: `${i} - ${j} = ?`,
          num1: i,
          num2: j,
          correctAnswer: i - j,
          wrongAnswers: generateWrongAnswers(i - j, 3, 20)
        });
      }
    }
  }
  
  // 5. 简单乘法（2-5表，40道）
  console.log('生成简单乘法...');
  for (let i = 2; i <= 5; i++) {
    for (let j = 2; j <= 9; j++) {
      questions.push({
        id: id++,
        type: 'multiplication',
        difficulty: 3,
        questionText: `${i} × ${j} = ?`,
        num1: i,
        num2: j,
        correctAnswer: i * j,
        wrongAnswers: generateWrongAnswers(i * j, 3, 50)
      });
    }
  }
  
  // 6. 复杂乘法（6-9表，40道）
  console.log('生成复杂乘法...');
  for (let i = 6; i <= 9; i++) {
    for (let j = 2; j <= 9; j++) {
      questions.push({
        id: id++,
        type: 'multiplication',
        difficulty: 4,
        questionText: `${i} × ${j} = ?`,
        num1: i,
        num2: j,
        correctAnswer: i * j,
        wrongAnswers: generateWrongAnswers(i * j, 3, 100)
      });
    }
  }
  
  // 7. 简单除法（30道）
  console.log('生成简单除法...');
  const divisors = [2, 3, 4, 5, 6];
  for (let divisor of divisors) {
    for (let quotient = 2; quotient <= 10; quotient++) {
      if (id <= 230) {
        const dividend = divisor * quotient;
        questions.push({
          id: id++,
          type: 'division',
          difficulty: 3,
          questionText: `${dividend} ÷ ${divisor} = ?`,
          num1: dividend,
          num2: divisor,
          correctAnswer: quotient,
          wrongAnswers: generateWrongAnswers(quotient, 3, 20)
        });
      }
    }
  }
  
  // 8. 复杂除法（30道）
  console.log('生成复杂除法...');
  const hardDivisors = [6, 7, 8, 9];
  for (let divisor of hardDivisors) {
    for (let quotient = 2; quotient <= 9; quotient++) {
      if (id <= 260) {
        const dividend = divisor * quotient;
        questions.push({
          id: id++,
          type: 'division',
          difficulty: 4,
          questionText: `${dividend} ÷ ${divisor} = ?`,
          num1: dividend,
          num2: divisor,
          correctAnswer: quotient,
          wrongAnswers: generateWrongAnswers(quotient, 3, 20)
        });
      }
    }
  }
  
  // 9. 比大小（40道）
  console.log('生成比大小题目...');
  for (let i = 0; i < 40; i++) {
    const num1 = Math.floor(Math.random() * 50) + 1;
    const num2 = Math.floor(Math.random() * 50) + 1;
    let correctAnswer;
    if (num1 < num2) correctAnswer = 0; // <
    else if (num1 === num2) correctAnswer = 1; // =
    else correctAnswer = 2; // >
    
    questions.push({
      id: id++,
      type: 'comparison',
      difficulty: 4,
      questionText: `比大小：${num1} __ ${num2}`,
      num1,
      num2,
      correctAnswer,
      wrongAnswers: []
    });
  }
  
  console.log(`生成完成！总共 ${questions.length} 道题目`);
  return questions;
}

/**
 * 生成错误答案
 */
function generateWrongAnswers(correctAnswer, count, maxRange) {
  const wrongAnswers = [];
  const used = new Set([correctAnswer]);
  
  let attempts = 0;
  while (wrongAnswers.length < count && attempts < 50) {
    const offset = Math.floor(Math.random() * 5) + 1;
    const wrongAnswer = Math.random() > 0.5 
      ? correctAnswer + offset 
      : correctAnswer - offset;
    
    if (wrongAnswer > 0 && wrongAnswer <= maxRange && !used.has(wrongAnswer)) {
      wrongAnswers.push(wrongAnswer);
      used.add(wrongAnswer);
    }
    attempts++;
  }
  
  // 如果不够3个，填充一些
  while (wrongAnswers.length < count) {
    const fallback = correctAnswer + wrongAnswers.length + 1;
    if (fallback > 0 && fallback <= maxRange) {
      wrongAnswers.push(fallback);
    }
  }
  
  return wrongAnswers;
}

// 生成并保存
const questionBank = {
  questions: generateQuestionBank()
};

const json = JSON.stringify(questionBank, null, 2);
fs.writeFileSync('assets/data/QuestionBank.json', json, 'utf8');

console.log('\n✅ 题库已保存到: assets/data/QuestionBank.json');
console.log(`📊 题目统计:`);

// 统计
const stats = {};
questionBank.questions.forEach(q => {
  const key = `${q.type}-难度${q.difficulty}`;
  stats[key] = (stats[key] || 0) + 1;
});

console.log(stats);
console.log('\n✨ 题库生成完成！');

