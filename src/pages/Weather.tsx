import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudSun, Sun, Droplets, Wind, MapPin, ArrowLeft, Settings, Thermometer, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Weather() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('Rio de Janeiro, RJ');
  
  // Mock data for Rio de Janeiro
  const weatherData = {
    temp: 31,
    condition: 'Ensolarado',
    humidity: 65,
    wind: 12,
    feelsLike: 34,
    high: 33,
    low: 24,
    forecast: [
      { day: 'Sex', temp: 32, icon: <Sun className="w-6 h-6 text-yellow-400" /> },
      { day: 'Sáb', temp: 30, icon: <CloudSun className="w-6 h-6 text-blue-200" /> },
      { day: 'Dom', temp: 29, icon: <CloudSun className="w-6 h-6 text-blue-200" /> },
      { day: 'Seg', temp: 31, icon: <Sun className="w-6 h-6 text-yellow-400" /> },
      { day: 'Ter', temp: 33, icon: <Sun className="w-6 h-6 text-yellow-400" /> },
    ]
  };

  return (
    <div className="min-h-screen bg-[#0078d7] text-white p-8 md:p-12 font-sans relative overflow-hidden">
      {/* Background Curves */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="white" />
        </svg>
      </div>

      <header className="flex items-center justify-between mb-12 relative z-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')}
            className="p-3 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
          <h1 className="text-5xl font-light tracking-tight">Clima</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xl font-medium flex items-center justify-end gap-2">
              <MapPin className="w-5 h-5" />
              {location}
            </p>
            <p className="text-sm opacity-60">Atualizado agora</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Main Weather Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="relative">
                <Sun className="w-32 h-32 text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.6)] animate-pulse" />
                <CloudSun className="w-16 h-16 text-white absolute -bottom-2 -right-2 drop-shadow-lg" />
              </div>
              <div>
                <span className="text-9xl font-thin leading-none">{weatherData.temp}°</span>
                <p className="text-2xl mt-2 opacity-80">{weatherData.condition}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 w-full md:w-auto">
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl">
                <Droplets className="w-6 h-6 text-blue-300" />
                <div>
                  <p className="text-xs opacity-60 uppercase font-bold">Umidade</p>
                  <p className="text-xl font-medium">{weatherData.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl">
                <Wind className="w-6 h-6 text-emerald-300" />
                <div>
                  <p className="text-xs opacity-60 uppercase font-bold">Vento</p>
                  <p className="text-xl font-medium">{weatherData.wind} km/h</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl">
                <Thermometer className="w-6 h-6 text-orange-300" />
                <div>
                  <p className="text-xs opacity-60 uppercase font-bold">Sensação</p>
                  <p className="text-xl font-medium">{weatherData.feelsLike}°</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-red-300" />
                <div>
                  <p className="text-xs opacity-60 uppercase font-bold">Máx / Mín</p>
                  <p className="text-xl font-medium">{weatherData.high}° / {weatherData.low}°</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold uppercase tracking-widest mb-6 opacity-60">Previsão para os próximos dias</h3>
            <div className="flex justify-between items-center overflow-x-auto pb-4 gap-4">
              {weatherData.forecast.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 min-w-[80px] bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                  <span className="font-bold">{item.day}</span>
                  {item.icon}
                  <span className="text-xl">{item.temp}°</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Settings & Locations */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl flex flex-col gap-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 opacity-60" />
              <h3 className="text-lg font-bold uppercase tracking-widest opacity-60">Configurações</h3>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm opacity-60 block mb-2">Localização Atual</span>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-white/50 transition-all"
                />
              </label>
              <div className="flex gap-2">
                <button className="flex-1 bg-white text-[#0078d7] font-bold py-3 rounded-xl hover:bg-white/90 transition-colors">Salvar</button>
                <button className="px-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors">
                  <MapPin className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold uppercase tracking-widest mb-6 opacity-60">Locais Salvos</h3>
            <div className="space-y-3">
              {['São Paulo, SP', 'Brasília, DF', 'Curitiba, PR'].map((city) => (
                <button key={city} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group">
                  <span className="font-medium">{city}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
