import React, { useState } from 'react';
import './App.css';

const TransportProblemSolver = () => {
  const defaultSuppliers = 3;
  const defaultConsumers = 3;
  const defaultSupply = [100, 150, 200];
  const defaultDemand = [120, 130, 200];
  const defaultCosts = [
    [2, 3, 1],
    [5, 4, 8],
    [5, 6, 8]
  ];

  const [suppliers, setSuppliers] = useState(defaultSuppliers);
  const [consumers, setConsumers] = useState(defaultConsumers);
  const [supply, setSupply] = useState([...defaultSupply]);
  const [demand, setDemand] = useState([...defaultDemand]);
  const [costs, setCosts] = useState(defaultCosts.map(row => [...row]));
  const [solution, setSolution] = useState([]);
  const [isSolving, setIsSolving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showFictitious, setShowFictitious] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  const checkBalance = () => {
    const totalSupply = supply.reduce((a, b) => a + b, 0);
    const totalDemand = demand.reduce((a, b) => a + b, 0);
    return { balanced: totalSupply === totalDemand, totalSupply, totalDemand };
  };

  const solveNorthWestCorner = async () => {
    setIsSolving(true);
    setCurrentStep(0);
    
    const balance = checkBalance();
    let adjustedSupply = [...supply];
    let adjustedDemand = [...demand];
    let adjustedCosts = [...costs.map(row => [...row])];
    
    if (!balance.balanced) {
      setShowFictitious(true);
      if (balance.totalSupply > balance.totalDemand) {
        adjustedDemand = [...demand, balance.totalSupply - balance.totalDemand];
        adjustedCosts = costs.map(row => [...row, 0]);
      } else {
        adjustedSupply = [...supply, balance.totalDemand - balance.totalSupply];
        adjustedCosts = [...costs, new Array(consumers).fill(0)];
      }
    }

    const solutionMatrix = Array(adjustedSupply.length)
      .fill()
      .map(() => Array(adjustedDemand.length).fill(0));

    let step = 0;
    let i = 0, j = 0;
    let remainingSupply = [...adjustedSupply];
    let remainingDemand = [...adjustedDemand];
    let totalCost = 0;

    while (i < adjustedSupply.length && j < adjustedDemand.length) {
      const quantity = Math.min(remainingSupply[i], remainingDemand[j]);
      solutionMatrix[i][j] = quantity;
      totalCost += quantity * adjustedCosts[i][j];
      
      remainingSupply[i] -= quantity;
      remainingDemand[j] -= quantity;

      await new Promise(resolve => setTimeout(resolve, 1000));
      setSolution([...solutionMatrix.map(row => [...row])]);
      setCurrentStep(++step);
      setTotalCost(totalCost);

      if (remainingSupply[i] === 0) i++;
      if (remainingDemand[j] === 0) j++;
    }

    setIsSolving(false);
  };

  const handleSupplyChange = (index, value) => {
    const newSupply = [...supply];
    newSupply[index] = parseInt(value) || 0;
    setSupply(newSupply);
  };

  const handleDemandChange = (index, value) => {
    const newDemand = [...demand];
    newDemand[index] = parseInt(value) || 0;
    setDemand(newDemand);
  };

  const handleCostChange = (i, j, value) => {
    const newCosts = [...costs];
    newCosts[i][j] = parseInt(value) || 0;
    setCosts(newCosts);
  };

  const addSupplier = () => {
    setSuppliers(suppliers + 1);
    setSupply([...supply, 100]);
    setCosts([...costs, new Array(consumers).fill(1)]);
  };

  const removeSupplier = () => {
    if (suppliers > 1) {
      setSuppliers(suppliers - 1);
      setSupply(supply.slice(0, -1));
      setCosts(costs.slice(0, -1));
    }
  };

  const addConsumer = () => {
    setConsumers(consumers + 1);
    setDemand([...demand, 100]);
    setCosts(costs.map(row => [...row, 1]));
  };

  const removeConsumer = () => {
    if (consumers > 1) {
      setConsumers(consumers - 1);
      setDemand(demand.slice(0, -1));
      setCosts(costs.map(row => row.slice(0, -1)));
    }
  };

  const handleSuppliersCountChange = (value) => {
    const newCount = parseInt(value) || 1;
    if (newCount >= 1 && newCount <= 10) {
      const currentCount = suppliers;
      setSuppliers(newCount);
      
      if (newCount > currentCount) {
        const additionalSuppliers = newCount - currentCount;
        const newSupply = [...supply];
        const newCosts = [...costs];
        
        for (let i = 0; i < additionalSuppliers; i++) {
          newSupply.push(100);
          newCosts.push(new Array(consumers).fill(1));
        }
        
        setSupply(newSupply);
        setCosts(newCosts);
      } else if (newCount < currentCount) {
        setSupply(supply.slice(0, newCount));
        setCosts(costs.slice(0, newCount));
      }
    }
  };

  const handleConsumersCountChange = (value) => {
    const newCount = parseInt(value) || 1;
    if (newCount >= 1 && newCount <= 10) {
      const currentCount = consumers;
      setConsumers(newCount);
      
      if (newCount > currentCount) {
        const additionalConsumers = newCount - currentCount;
        const newDemand = [...demand];
        const newCosts = costs.map(row => [...row]);
        
        for (let i = 0; i < additionalConsumers; i++) {
          newDemand.push(100);
          newCosts.forEach(row => row.push(1));
        }
        
        setDemand(newDemand);
        setCosts(newCosts);
      } else if (newCount < currentCount) {
        setDemand(demand.slice(0, newCount));
        setCosts(costs.map(row => row.slice(0, newCount)));
      }
    }
  };

  const resetProblem = () => {
    setSuppliers(defaultSuppliers);
    setConsumers(defaultConsumers);
    setSupply([...defaultSupply]);
    setDemand([...defaultDemand]);
    setCosts(defaultCosts.map(row => [...row]));
    setSolution([]);
    setCurrentStep(0);
    setShowFictitious(false);
    setTotalCost(0);
  };

  const generateRandomData = () => {
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const newSuppliers = rand(2, 5);
    const newConsumers = rand(2, 5);

    const newSupply = Array.from({ length: newSuppliers }, () => rand(50, 300));
    const newDemand = Array.from({ length: newConsumers }, () => rand(50, 300));
    const newCosts = Array.from({ length: newSuppliers }, () =>
      Array.from({ length: newConsumers }, () => rand(1, 10))
    );

    setSuppliers(newSuppliers);
    setConsumers(newConsumers);
    setSupply(newSupply);
    setDemand(newDemand);
    setCosts(newCosts);
    setSolution([]);
    setShowFictitious(false);
    setCurrentStep(0);
    setTotalCost(0);
  };

  const balance = checkBalance();

  return (
    <div className="transport-solver">
      <h1>Решение транспортной задачи</h1>
      <h2>Метод северо-западного угла</h2>

      <div className="control-panel">
        <div className="counter-controls">
          <div className="counter-group">
            <label>Поставщики:</label>
            <div className="counter-buttons">
              <button onClick={removeSupplier}>-</button>
              <input
                type="number"
                min="1"
                max="10"
                value={suppliers}
                onChange={(e) => handleSuppliersCountChange(e.target.value)}
                disabled={isSolving}
                className="counter-input"
              />
              <button onClick={addSupplier}>+</button>
            </div>
          </div>
          
          <div className="counter-group">
            <label>Потребители:</label>
            <div className="counter-buttons">
              <button onClick={removeConsumer}>-</button>
              <input
                type="number"
                min="1"
                max="10"
                value={consumers}
                onChange={(e) => handleConsumersCountChange(e.target.value)}
                disabled={isSolving}
                className="counter-input"
              />
              <button onClick={addConsumer}>+</button>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={addSupplier}>Добавить поставщика</button>
          <button onClick={addConsumer}>Добавить потребителя</button>
          <button onClick={generateRandomData}>🎲 Случайные данные</button>
          <button onClick={resetProblem}>Сброс</button>
          <button 
            onClick={solveNorthWestCorner} 
            disabled={isSolving}
            className="solve-btn"
          >
            {isSolving ? 'Решение...' : 'Решить задачу'}
          </button>
        </div>
      </div>
      
      <div className="input-table">
        <h3>Исходные данные</h3>
        <table>
          <thead>
            <tr>
              <th></th>
              {Array.from({ length: consumers }, (_, j) => (
                <th key={j}>Потребитель B{j + 1}</th>
              ))}
              <th>Запасы</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: suppliers }, (_, i) => (
              <tr key={i}>
                <th>Поставщик A{i + 1}</th>
                {Array.from({ length: consumers }, (_, j) => (
                  <td key={j}>
                    <input
                      type="number"
                      value={costs[i]?.[j] || 0}
                      onChange={(e) => handleCostChange(i, j, e.target.value)}
                      disabled={isSolving}
                    />
                  </td>
                ))}
                <td>
                  <input
                    type="number"
                    value={supply[i] || 0}
                    onChange={(e) => handleSupplyChange(i, e.target.value)}
                    disabled={isSolving}
                  />
                </td>
              </tr>
            ))}
            <tr>
              <th>Заявки</th>
              {Array.from({ length: consumers }, (_, j) => (
                <td key={j}>
                  <input
                    type="number"
                    value={demand[j] || 0}
                    onChange={(e) => handleDemandChange(j, e.target.value)}
                    disabled={isSolving}
                  />
                </td>
              ))}
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={`balance-info ${!balance.balanced ? 'unbalanced' : ''}`}>
        <h3>Баланс системы:</h3>
        <p>Сумма запасов: {balance.totalSupply}</p>
        <p>Сумма заявок: {balance.totalDemand}</p>
        <p>Статус: {balance.balanced ? 'Сбалансирована' : 'Несбалансирована'}</p>
        {!balance.balanced && (
          <p className="fictitious-note">
            ⚠️ Будет добавлен {balance.totalSupply > balance.totalDemand ? 
              'фиктивный потребитель' : 'фиктивный поставщик'}
          </p>
        )}
      </div>

      {solution.length > 0 && (
        <div className="solution">
          <h3>
            Опорное решение {isSolving ? `(Шаг ${currentStep})` : '(Финальное)'}
          </h3>
          
          {showFictitious && (
            <div className="fictitious-info">
              <p>⚠️ Добавлен {balance.totalSupply > balance.totalDemand ? 
                'фиктивный потребитель' : 'фиктивный поставщик'} для балансировки</p>
            </div>
          )}

          <table className={`solution-table ${isSolving ? 'solving' : ''}`}>
            <thead>
              <tr>
                <th></th>
                {Array.from({ length: solution[0]?.length || consumers }, (_, j) => (
                  <th key={j}>
                    B{j + 1}
                    {showFictitious && j === consumers && ' (фикт.)'}
                  </th>
                ))}
                <th>Запасы</th>
              </tr>
            </thead>
            <tbody>
              {solution.map((row, i) => (
                <tr key={i}>
                  <th>
                    A{i + 1}
                    {showFictitious && i === suppliers && ' (фикт.)'}
                  </th>
                  {row.map((cell, j) => (
                    <td key={j} className={cell > 0 ? 'allocated' : ''}>
                      {cell > 0 && (
                        <span className="allocation">
                          {cell}
                          <br />
                          <small>({costs[i]?.[j] || 0} × {cell})</small>
                        </span>
                      )}
                    </td>
                  ))}
                  <td>{supply[i] || '-'}</td>
                </tr>
              ))}
              <tr>
                <th>Заявки</th>
                {Array.from({ length: solution[0]?.length || consumers }, (_, j) => (
                  <td key={j}>{demand[j] || '-'}</td>
                ))}
                <td></td>
              </tr>
            </tbody>
          </table>

          {!isSolving && (
            <div className="total-cost">
              <h4>Общая стоимость перевозок: {totalCost} у.е.</h4>
            </div>
          )}
        </div>
      )}

      {isSolving && (
        <div className="animation-overlay">
          <div className="spinner"></div>
          <p>Выполняется расчет методом северо-западного угла...</p>
        </div>
      )}
    </div>
  );
};

export default TransportProblemSolver;