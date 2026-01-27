import React, { useState, useEffect } from 'react';
import { Users, Plus, Calculator, Zap, ChevronLeft, ChevronRight, Save, Landmark, Package } from 'lucide-react';

const FormInput = ({ label, name, type = 'text', value, onChange, placeholder, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder || `Ingrese ${label.toLowerCase()}`}
      required={required}
      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
    />
  </div>
);

const ResultItem = ({ label, value, isCurrency = false, highlight = false }) => (
  <div className={`flex justify-between items-center border-b border-gray-100 pb-2 ${highlight ? 'bg-yellow-50 p-2 rounded' : ''}`}>
    <span className={`text-sm ${highlight ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{label}</span>
    <span className={`font-bold ${highlight ? 'text-xl text-primary' : 'text-gray-900'}`}>
      {isCurrency 
        ? parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
        : value}
    </span>
  </div>
);

const FinanceResultItem = ({ label, value, unit, highlight = false }) => (
    <div className={`p-4 rounded-lg flex flex-col items-center justify-center text-center ${highlight ? 'bg-primary/10 text-primary' : 'bg-gray-50'}`}>
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className={`text-2xl font-extrabold ${highlight ? 'text-primary' : 'text-gray-900'}`}>
        {value}
        {unit && <span className="text-base font-medium ml-1">{unit}</span>}
      </span>
    </div>
  );

const ProjectSection = ({ activities, onSaveNew, onUpdateClient, onSaveProject }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  const steps = ["Cliente", "Concesionaria", "Consumo", "Dimensión", "Presupuesto", "Financiamiento", "Kit"];

  // --- ESTADOS DEL PROYECTO ---
  
  // 1. Cliente
  const [selectedClientId, setSelectedClientId] = useState('');
  const selectedClient = activities.find(c => c.id === parseInt(selectedClientId));

  // 2. Concesionaria
  const [concesionaria, setConcesionaria] = useState('');

  // 3. Consumo
  const [consumoData, setConsumoData] = useState({
    geradora: 'Sim',
    unidadConsumo: '',
    fase: 'Trifásica',
    grupoTarifario: 'B3',
    fatSimul: 30,
    costoFijo: '',
    tarifa: '',
    meses: {
      Jan: '', Fev: '', Mar: '', Abr: '', Mai: '', Jun: '',
      Jul: '', Ago: '', Set: '', Out: '', Nov: '', Dez: ''
    }
  });

  // 4. Dimensión
  const [potenciaPanel, setPotenciaPanel] = useState(610);
  const [fp, setFp] = useState(75);
  const [result, setResult] = useState(null);

  // 5. Presupuesto
  const [budget, setBudget] = useState({
    kitSelection: 'Informar Manualmente',
    valorKit: 40186.33,
    descontoKit: 0,
    maoDeObra: 80,
    matAdicionalPct: 5,
    valorProjeto: 2638.51,
    comissao1Pct: 5,
    comissao2Pct: 0,
    impostoServicoPct: 13.5,
    margemEmpPct: 15,
    manualPanelCount: 48
  });

  // 6. Financiamiento
  const [financingData, setFinancingData] = useState({
    taxaFinanciamento: 1.90,
    numParcelas: 72,
    tir: 10.37,
    faturaAntesSolar: '',
    faturaAposSolar: '',
    economiaSistema: '',
    valorParcela: '',
    tempoRetorno: '',
    retornoInvestimento: ''
  });

  // 7. Kit
  const [kitData, setKitData] = useState({
    moduleBrand: 'DAH BIFACIAL',
    moduleLinearWarranty: 25,
    moduleDefectWarranty: 13,
    inverterBrand: 'GOODWE',
    inverterQuantity: 1,
    inverterPower: 37.00,
    inverterDefectWarranty: 10,
    observation: ''
  });

  // --- LÓGICA DE CÁLCULOS ---

  // Cálculos de Consumo (Derivados)
  const values = Object.values(consumoData.meses).map(v => parseFloat(v) || 0);
  const consumoTotal = values.reduce((a, b) => a + b, 0);
  const consumoMedio = values.some(v => v > 0) ? consumoTotal / 12 : 0;
  const costoMedioMensual = (consumoMedio * (parseFloat(consumoData.tarifa) || 0)) + (parseFloat(consumoData.costoFijo) || 0);

  // Handlers
  const handleConsumoChange = (e) => {
    const { name, value } = e.target;
    if (name in consumoData.meses) {
      setConsumoData(prev => ({ ...prev, meses: { ...prev.meses, [name]: value } }));
    } else {
      setConsumoData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFinancingChange = (e) => {
    const { name, value } = e.target;
    setFinancingData(prev => ({ ...prev, [name]: value }));
  };

  const handleKitChange = (e) => {
    const { name, value } = e.target;
    setKitData(prev => ({ ...prev, [name]: value }));
  };

  const calculateDimension = (e) => {
    if (e) e.preventDefault();
    const kwh = consumoMedio;
    const panelWatts = parseFloat(potenciaPanel);
    const powerFactor = parseFloat(fp) / 100;

    if (!kwh || !panelWatts || !powerFactor) {
      alert("Por favor, complete los datos de consumo y parámetros de dimensión.");
      return;
    }

    const consumoDiario = kwh / 30;
    const potenciaIdeal = consumoDiario / (4.5 * powerFactor);
    const cantidadPaneles = Math.ceil((potenciaIdeal * 1000) / panelWatts);
    const areaMinima = cantidadPaneles * 2.74;
    const estimatedCost = 15000 + (cantidadPaneles * 3500);
    const monthlyProduction = Math.round(cantidadPaneles * panelWatts * 4.5 * 30 / 1000);

    setResult({
      potenciaIdeal: potenciaIdeal.toFixed(2),
      cantidadPaneles,
      areaMinima: areaMinima.toFixed(2),
      estimatedCost: estimatedCost.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
      rawCost: `$ ${estimatedCost.toLocaleString('es-MX')}`,
      monthlyProduction
    });
  };

  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setBudget(prev => ({ ...prev, [name]: value }));
  };

  // Cálculos de Presupuesto (Derivados)
  const custoFinalKit = parseFloat(budget.valorKit) - parseFloat(budget.descontoKit);
  const qtdePaineis = budget.kitSelection === 'Informar Manualmente' 
    ? (parseFloat(budget.manualPanelCount) || 0)
    : (result ? result.cantidadPaneles : 0);
  const calculoMaoDeObra = qtdePaineis * parseFloat(budget.maoDeObra);
  const valMatAdicional = custoFinalKit * (parseFloat(budget.matAdicionalPct) / 100); 
  
  const taxRate = parseFloat(budget.impostoServicoPct) / 100;
  const marginRate = parseFloat(budget.margemEmpPct) / 100;
  const commRate = (parseFloat(budget.comissao1Pct) + parseFloat(budget.comissao2Pct)) / 100;
  
  const baseCosts = custoFinalKit + calculoMaoDeObra + valMatAdicional + parseFloat(budget.valorProjeto);
  const denominator = 1 - marginRate - commRate - taxRate;
  
  let precoVenda = 0;
  if (denominator > 0) {
    precoVenda = (baseCosts - (custoFinalKit * taxRate)) / denominator;
  }

  const valImposto = (precoVenda - custoFinalKit) * taxRate;
  const lucro = precoVenda * marginRate;
  const valorKwp = result && parseFloat(result.potenciaIdeal) > 0 ? precoVenda / parseFloat(result.potenciaIdeal) : 0;

  // 6. Cálculos de Financiamiento (Derivados)
  const valorFinanciado = precoVenda;
  const taxaMensal = (parseFloat(financingData.taxaFinanciamento) || 0) / 100;
  const numParcelasFin = parseInt(financingData.numParcelas) || 0;

  // --- GUARDADO FINAL ---
  const handleFinalSave = () => {
    const projectData = {
      rawCost: precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    };

    if (selectedClient) {
      // Actualizar cliente existente
      onUpdateClient({
        ...selectedClient,
        amount: projectData.rawCost,
        status: 'En Proceso' // Actualizar estado a En Proceso
      });
      alert(`Proyecto asignado a ${selectedClient.name} con éxito.`);
    } else {
      // Crear nuevo prospecto (abre el modal de cliente)
      onSaveNew({
        // Pre-populamos el monto, el resto se llena en el modal
        amount: projectData.rawCost,
      });
    }
  };

  // --- NAVEGACIÓN ---
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div>
      {/* Header del Wizard */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-2xl text-gray-900">Nuevo Proyecto</h3>
          <p className="text-gray-500 text-sm">Paso {currentStep} de {totalSteps}: <span className="font-bold text-primary">{steps[currentStep - 1]}</span></p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-2 flex-1 sm:w-8 rounded-full transition-colors ${i + 1 <= currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      {/* CONTENIDO DEL PASO */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 min-h-[400px]">
        
        {/* PASO 1: CLIENTE */}
        {currentStep === 1 && (
          <div className="animate-fade-in-up">
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Cliente</label>
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
              <div className="relative flex-grow w-full">
              <select
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none bg-white appearance-none"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              <option value="">-- Nuevo Prospecto --</option>
              {activities.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.status})
                </option>
              ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <button onClick={() => onSaveNew({})} className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
              <Plus size={16} /> Registrar Cliente
            </button>
            </div>
            {selectedClient && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
                <p><strong>Cliente seleccionado:</strong> {selectedClient.name} | <strong>Email:</strong> {selectedClient.email}</p>
              </div>
            )}
          </div>
        )}

        {/* PASO 2: CONCESIONARIA */}
        {currentStep === 2 && (
          <div className="animate-fade-in-up max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa Concesionaria</label>
            <select
              value={concesionaria}
              onChange={(e) => setConcesionaria(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none bg-white"
            >
              <option value="">-- Seleccione Empresa --</option>
              <option value="CFE">CFE</option>
              <option value="Luz y Fuerza">Luz y Fuerza</option>
            </select>
          </div>
        )}

        {/* PASO 3: CONSUMO */}
        {currentStep === 3 && (
          <div className="animate-fade-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Geradora</label>
                <select name="geradora" value={consumoData.geradora} onChange={handleConsumoChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none bg-white">
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
              <FormInput label="Unid. Consumo" name="unidadConsumo" value={consumoData.unidadConsumo} onChange={handleConsumoChange} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fase</label>
                <select name="fase" value={consumoData.fase} onChange={handleConsumoChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none bg-white">
                  <option value="Monofásica">Monofásica</option>
                  <option value="Bifásica">Bifásica</option>
                  <option value="Trifásica">Trifásica</option>
                </select>
              </div>
              <FormInput label="Grupo Tarifário" name="grupoTarifario" value={consumoData.grupoTarifario} onChange={handleConsumoChange} />
              <FormInput label="Fat. Simul. (%)" name="fatSimul" type="number" value={consumoData.fatSimul} onChange={handleConsumoChange} />
              <FormInput label="Custo Fixo (R$)" name="costoFijo" type="number" value={consumoData.costoFijo} onChange={handleConsumoChange} />
              <FormInput label="Tarifa (R$)" name="tarifa" type="number" value={consumoData.tarifa} onChange={handleConsumoChange} />
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
            <h5 className="font-bold text-sm text-gray-700 mb-3">Histórico de Consumo (kWh)</h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.keys(consumoData.meses).map((mes) => (
                <div key={mes}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{mes}</label>
                  <input
                    type="number"
                    name={mes}
                    value={consumoData.meses[mes]}
                    onChange={handleConsumoChange}
                    className="w-full px-2 py-1 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              ))}
            </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
            <h5 className="font-bold text-sm text-gray-700 mb-3">Resumen de Consumo</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-xs text-gray-500 block">Consumo Total</span>
                <span className="font-bold text-lg text-gray-800">{consumoTotal.toLocaleString('pt-BR')} kWh</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-xs text-gray-500 block">Consumo Médio</span>
                <span className="font-bold text-lg text-gray-800">{consumoMedio.toLocaleString('pt-BR', {maximumFractionDigits: 3})} kWh</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-xs text-gray-500 block">Custo Médio Mensal</span>
                <span className="font-bold text-lg text-green-600">R$ {costoMedioMensual.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 3})}</span>
              </div>
            </div>
            </div>
          </div>
        )}

        {/* PASO 4: DIMENSIÓN */}
        {currentStep === 4 && (
          <div className="animate-fade-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <FormInput label="Potência do Painel (W)" type="number" name="potenciaPanel" value={potenciaPanel} onChange={e => setPotenciaPanel(e.target.value)} required />
              <FormInput label="FP (%)" type="number" name="fp" value={fp} onChange={e => setFp(e.target.value)} required />
            </div>
            
            <button onClick={calculateDimension} className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-primary transition-colors flex items-center justify-center gap-2 mb-8">
              <Calculator size={16} /> Calcular Dimensión
            </button>

            {result && (
              <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl">
                <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2"><Zap className="text-primary" /> Resultados</h4>
                <div className="space-y-3">
                  <ResultItem label="Potência do Sistema" value={`${result.potenciaIdeal} kWp`} />
                  <ResultItem label="Qtde. Painéis" value={`${result.cantidadPaneles} pzas`} />
                  <ResultItem label="Área mínima" value={`${result.areaMinima} m²`} />
                  <ResultItem label="Producción Estimada" value={`${result.monthlyProduction} kWh/mes`} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 5: PRESUPUESTO */}
        {currentStep === 5 && (
          <div className="animate-fade-in-up space-y-4">
             {/* Kit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Selecionar Kit</label>
                  <select name="kitSelection" value={budget.kitSelection} onChange={handleBudgetChange} className="w-full p-2 rounded border border-gray-300 text-xs">
                    <option value="Informar Manualmente">Informar Manualmente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Qtde. Painéis</label>
                  <input 
                    type="number" 
                    name="manualPanelCount"
                    value={qtdePaineis} 
                    onChange={handleBudgetChange}
                    disabled={budget.kitSelection !== 'Informar Manualmente'}
                    className={`w-full p-2 rounded border border-gray-200 text-xs font-bold ${budget.kitSelection === 'Informar Manualmente' ? 'bg-white border-gray-300' : 'bg-gray-50'}`} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <FormInput label="Valor do Kit" name="valorKit" type="number" value={budget.valorKit} onChange={handleBudgetChange} />
                <FormInput label="Desconto Kit" name="descontoKit" type="number" value={budget.descontoKit} onChange={handleBudgetChange} />
                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                  <label className="block text-xs text-gray-500">Custo Final Kit</label>
                  <div className="font-bold text-gray-900">{custoFinalKit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                </div>
              </div>

              {/* Labor & Materials */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <FormInput label="Mão de Obra (Un)" name="maoDeObra" type="number" value={budget.maoDeObra} onChange={handleBudgetChange} />
                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                  <label className="block text-xs text-gray-500">Calc. Mão de Obra</label>
                  <div className="font-bold text-gray-900">{calculoMaoDeObra.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                </div>
                <FormInput label="Mat. Adicional (%)" name="matAdicionalPct" type="number" value={budget.matAdicionalPct} onChange={handleBudgetChange} />
              </div>

              {/* Project & Tax */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <FormInput label="Valor do Projeto" name="valorProjeto" type="number" value={budget.valorProjeto} onChange={handleBudgetChange} />
                <FormInput label="Imposto Serviço (%)" name="impostoServicoPct" type="number" value={budget.impostoServicoPct} onChange={handleBudgetChange} />
                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                  <label className="block text-xs text-gray-500">Valor Imposto</label>
                  <div className="font-bold text-gray-900">{valImposto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                </div>
              </div>

              {/* Commissions & Margin */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <FormInput label="Comissão 01 (%)" name="comissao1Pct" type="number" value={budget.comissao1Pct} onChange={handleBudgetChange} />
                <FormInput label="Comissão 02 (%)" name="comissao2Pct" type="number" value={budget.comissao2Pct} onChange={handleBudgetChange} />
                <FormInput label="Margem Emp. (%)" name="margemEmpPct" type="number" value={budget.margemEmpPct} onChange={handleBudgetChange} />
              </div>

              {/* Final Results */}
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <ResultItem label="Lucro" value={lucro} isCurrency />
                <ResultItem label="Valor KWP" value={valorKwp} isCurrency />
                <ResultItem label="Preço de Venda" value={precoVenda} isCurrency highlight />
              </div>
          </div>
        )}

        {/* PASO 6: FINANCIAMIENTO */}
        {currentStep === 6 && (
            <div className="animate-fade-in-up">
                <h4 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                    <Landmark className="text-primary" /> Simulación de Financiamiento
                </h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left side: Inputs */}
                    <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h5 className="font-bold text-gray-800">Parámetros del Financiamiento</h5>
                        <FormInput 
                            label="Taxa do Financiamento (% a.m.)" 
                            name="taxaFinanciamento" 
                            type="number" 
                            value={financingData.taxaFinanciamento} 
                            onChange={handleFinancingChange} 
                        />
                        <FormInput 
                            label="N° de Parcelas" 
                            name="numParcelas" 
                            type="number" 
                            value={financingData.numParcelas} 
                            onChange={handleFinancingChange} 
                        />
                        <FormInput 
                            label="TIR (%)" 
                            name="tir" 
                            type="number" 
                            value={financingData.tir} 
                            onChange={handleFinancingChange} 
                        />
                    </div>

                    {/* Right side: Results */}
                    <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h5 className="font-bold text-gray-800">Resultados de la Simulación</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormInput label="Fatura antes do solar (R$)" name="faturaAntesSolar" value={financingData.faturaAntesSolar} onChange={handleFinancingChange} />
                            <FormInput label="Fatura após solar (R$)" name="faturaAposSolar" value={financingData.faturaAposSolar} onChange={handleFinancingChange} />
                            <FormInput label="Economia sistema (%)" name="economiaSistema" value={financingData.economiaSistema} onChange={handleFinancingChange} />
                            <FormInput label="Valor da parcela (R$)" name="valorParcela" value={financingData.valorParcela} onChange={handleFinancingChange} />
                            <FormInput label="Tempo de retorno (anos)" name="tempoRetorno" value={financingData.tempoRetorno} onChange={handleFinancingChange} />
                            <FormInput label="Retorno Investimento (R$)" name="retornoInvestimento" value={financingData.retornoInvestimento} onChange={handleFinancingChange} />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* PASO 7: KIT */}
        {currentStep === 7 && (
          <div className="animate-fade-in-up">
            <h4 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
              <Package className="text-primary" /> Configuración del Kit
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              {/* Módulo Fotovoltaico */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h5 className="font-bold text-gray-800 border-b border-gray-100 pb-2">Módulo Fotovoltaico</h5>
                <FormInput label="Marca" name="moduleBrand" value={kitData.moduleBrand} onChange={handleKitChange} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput label="Garantia Linear (anos)" name="moduleLinearWarranty" type="number" value={kitData.moduleLinearWarranty} onChange={handleKitChange} />
                  <FormInput label="Garantia Defeito (anos)" name="moduleDefectWarranty" type="number" value={kitData.moduleDefectWarranty} onChange={handleKitChange} />
                </div>
              </div>

              {/* Inversor Fotovoltaico */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h5 className="font-bold text-gray-800 border-b border-gray-100 pb-2">Inversor Fotovoltaico</h5>
                <FormInput label="Marca" name="inverterBrand" value={kitData.inverterBrand} onChange={handleKitChange} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormInput label="Quantidade" name="inverterQuantity" type="number" value={kitData.inverterQuantity} onChange={handleKitChange} />
                  <FormInput label="Potência Total (kW)" name="inverterPower" type="number" value={kitData.inverterPower} onChange={handleKitChange} />
                  <FormInput label="Garantia (anos)" name="inverterDefectWarranty" type="number" value={kitData.inverterDefectWarranty} onChange={handleKitChange} />
                </div>
              </div>
            </div>

            {/* Observación */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Observación</label>
              <textarea
                name="observation"
                value={kitData.observation}
                onChange={handleKitChange}
                rows="3"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none resize-none"
                placeholder="Notas adicionales sobre el kit o la instalación..."
              ></textarea>
            </div>
          </div>
        )}

      </div>

      {/* BOTONES DE NAVEGACIÓN */}
      <div className="flex justify-between">
        <button onClick={prevStep} disabled={currentStep === 1} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors ${currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
          <ChevronLeft size={20} /> Anterior
        </button>
        
        {currentStep < totalSteps ? (
          <button onClick={nextStep} className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary transition-colors">
            Siguiente <ChevronRight size={20} />
          </button>
        ) : (
          <button onClick={handleFinalSave} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/30">
            <Save size={20} /> Guardar Proyecto
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectSection;
