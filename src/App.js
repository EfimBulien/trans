import React, { useState, useEffect } from 'react';
import './App.css';

const TransportProblemSolver = () => {
  const [suppliers, setSuppliers] = useState(3);
  const [consumers, setConsumers] = useState(3);
  const [supply, setSupply] = useState([100, 150, 200]);
  const [demand, setDemand] = useState([120, 130, 200]);
  const [costs, setCosts] = useState([
    [2, 3, 1],
    [5, 4, 8],
    [5, 6, 8]
  ]);
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

  const addConsumer = () => {
    setConsumers(consumers + 1);
    setDemand([...demand, 100]);
    setCosts(costs.map(row => [...row, 1]));
  };

  const resetProblem = () => {
    setSolution([]);
    setCurrentStep(0);
    setTotalCost(0);
    setShowFictitious(false);
  };

  const balance = checkBalance();

  return (
    <div className="transport-solver">
      <h1>Решение транспортной задачи</h1>
      <h2>Метод северо-западного угла</h2>

      <div className="control-panel">
        <button onClick={addSupplier}>+ Добавить поставщика</button>
        <button onClick={addConsumer}>+ Добавить потребителя</button>
        <button onClick={resetProblem}>Сброс</button>
        <button 
          onClick={solveNorthWestCorner} 
          disabled={isSolving}
          className="solve-btn"
        >
          {isSolving ? 'Решение...' : 'Решить задачу'}
        </button>
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