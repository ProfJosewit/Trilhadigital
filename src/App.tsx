/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, 
  UserCircle, 
  Star, 
  Trophy, 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronLeft, 
  LogOut, 
  Search,
  CheckCircle2,
  Award,
  Settings,
  ShieldCheck,
  Bell,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

// --- Types & Constants ---

interface Medal {
  id: string;
  name: string;
  icon: string;
}

const MEDALS: Medal[] = [
  { id: 'google', name: 'Aluno Google', icon: '🌐' },
  { id: 'fila', name: 'Aluno Organizado na Fila', icon: '🚶' },
  { id: 'ajudante', name: 'Aluno Ajudante', icon: '🤝' },
  { id: 'focado', name: 'Aluno Focado', icon: '🎯' },
  { id: 'colaborativo', name: 'Aluno Colaborativo', icon: '👥' },
  { id: 'respeitoso', name: 'Aluno Respeitoso', icon: '🙏' },
  { id: 'organizado', name: 'Aluno Organizado', icon: '📁' },
  { id: 'falar', name: 'Aluno que Respeita a Vez de Falar', icon: '🗣️' },
  { id: 'sala_aula', name: 'Aluno que Domina o Google Sala de Aula', icon: '🏫' },
  { id: 'criativo', name: 'Aluno Criativo', icon: '🎨' },
  { id: 'pontual', name: 'Aluno Pontual', icon: '⏰' },
  { id: 'superacao', name: 'Aluno Superação', icon: '🚀' },
];

const AVATARS = [
  '😀', '😃', '😄', '😁', '😆', '🤣', '😎', '🥳', '😇', '😊', 
  '🙂', '😉', '😍', '🤩', '😱', '😨', '😰', '🤔', '🤨', '🧐', 
  '🤗', '🤭', '🤫', '🚀', '🛸', '🌎', '🪐', '🔭', '🧑‍🚀', '🎮', 
  '🕹️', '🎲', '♟️', '🧩', '🧠', '🐶', '🐱'
]; // Fire emoji (🔥) is strictly excluded

interface Student {
  id: string;
  name: string;
  email: string;
  stars: number; // 0-3
  medals: string[]; // IDs of earned medals
  avatar: string;
  suggestion?: string;
  suggestionStatus?: 'pending' | 'approved' | 'denied';
}

type View = 'landing' | 'teacher_login' | 'teacher_dashboard' | 'student_login' | 'student_dashboard' | 'ranking';

// --- Components ---

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  key?: string | number;
}

const GlassCard = ({ children, className = "" }: GlassCardProps) => (
  <div className={`backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-[2.5rem] shadow-[0_0_30px_rgba(59,130,246,0.15)] glow-border transition-all duration-500 ${className}`}>
    {children}
  </div>
);

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'blue' | 'purple' | 'pink' | 'lime';
  className?: string;
}

const NeonButton = ({ children, onClick, variant = 'blue', className = "" }: NeonButtonProps) => {
  const colors = {
    blue: 'bg-blue-500 hover:bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]',
    purple: 'bg-purple-500 hover:bg-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.6)]',
    pink: 'bg-pink-500 hover:bg-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.6)]',
    lime: 'bg-lime-500 hover:bg-lime-400 shadow-[0_0_20px_rgba(132,204,22,0.6)]',
  };
  
  return (
    <motion.button 
      whileHover={{ scale: 1.05, y: -4, rotate: [-1, 1, -1] }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-8 py-4 rounded-2xl font-display font-bold text-lg transition-all text-white tracking-wide ${colors[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: 20, x: '-50%' }}
    className={`fixed bottom-8 left-1/2 z-[100] px-6 py-3 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center gap-3 min-w-[300px] ${
      type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' : 'bg-red-500/20 border-red-500/50 text-red-200'
    }`}
  >
    <Bell size={20} />
    <span className="flex-1 font-medium">{message}</span>
    <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
      <X size={16} />
    </button>
  </motion.div>
);

const FloatingParticles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 cyber-grid">
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${i % 2 === 0 ? 'bg-blue-400/30' : 'bg-pink-400/30'}`}
          style={{
            width: Math.random() * 8 + 4 + 'px',
            height: Math.random() * 8 + 4 + 'px',
          }}
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: Math.random() * 100 + '%',
            opacity: Math.random() * 0.4 + 0.1
          }}
          animate={{ 
            y: [null, '-120%'],
            x: [null, (Math.random() - 0.5) * 20 + '%'],
            opacity: [0, 0.6, 0]
          }}
          transition={{ 
            duration: Math.random() * 15 + 15, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: Math.random() * 10
          }}
        />
      ))}
    </div>
  );
};

// --- View Components (Moved outside App to fix focus issues) ---

const LandingView = ({ setView }: { setView: (v: View) => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#05050a] text-white overflow-hidden relative">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_70%)]" />
    
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center z-10"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-8 inline-block"
      >
        <div className="bg-blue-500/20 p-6 rounded-[3rem] border-2 border-blue-500/30 glow-border">
          <Trophy size={80} className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
        </div>
      </motion.div>
      
      <h1 className="text-7xl md:text-8xl font-display font-bold mb-6 tracking-tight glow-text">
        <span className="text-blue-400">TRILHA</span>
        <span className="text-pink-500 ml-4">DIGITAL</span>
      </h1>
      
      <p className="font-sans text-blue-200/70 mb-12 text-xl max-w-lg mx-auto leading-relaxed">
        Aventura espacial rumo ao conhecimento! 🚀<br/>
        Ganhe estrelas e medalhas lendárias.
      </p>

      <div className="flex flex-col sm:flex-row gap-6 justify-center">
        <NeonButton onClick={() => setView('teacher_login')} variant="purple" className="flex items-center gap-3">
          <ShieldCheck size={24} /> Professor
        </NeonButton>
        <NeonButton onClick={() => setView('student_login')} variant="pink" className="flex items-center gap-3">
          <UserCircle size={24} /> Aluno
        </NeonButton>
        <NeonButton onClick={() => setView('ranking')} variant="blue" className="flex items-center gap-3">
          <Trophy size={24} /> Ranking
        </NeonButton>
      </div>
    </motion.div>
  </div>
);

const RankingView = ({ students, setView }: { students: Student[], setView: (v: View) => void }) => {
  const [sortBy, setSortBy] = useState<'stars' | 'medals'>('stars');

  const sortedStudents = [...students].sort((a, b) => {
    if (sortBy === 'stars') {
      if (b.stars !== a.stars) return b.stars - a.stars;
      return b.medals.length - a.medals.length;
    } else {
      if (b.medals.length !== a.medals.length) return b.medals.length - a.medals.length;
      return b.stars - a.stars;
    }
  });

  return (
    <div className="min-h-screen bg-[#05050a] text-white p-4 md:p-8 relative font-sans overflow-x-hidden">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-pink-600/5 blur-[150px] -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-2xl border border-blue-500/30">
              <Trophy size={32} className="text-blue-400" />
            </div>
            <h1 className="text-4xl font-display font-bold text-blue-400 glow-text">Ranking de Exploradores</h1>
          </div>
          <button onClick={() => setView('landing')} className="p-4 bg-white/5 rounded-2xl border-2 border-white/10 hover:bg-white/10 transition-all">
            <ChevronLeft size={28} />
          </button>
        </header>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setSortBy('stars')}
            className={`px-6 py-3 rounded-xl font-display font-bold transition-all border-2 ${sortBy === 'stars' ? 'bg-blue-500 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-white/10 text-white/40'}`}
          >
            Por Estrelas ⭐
          </button>
          <button 
            onClick={() => setSortBy('medals')}
            className={`px-6 py-3 rounded-xl font-display font-bold transition-all border-2 ${sortBy === 'medals' ? 'bg-purple-500 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white/5 border-white/10 text-white/40'}`}
          >
            Por Medalhas 🏅
          </button>
        </div>

        <div className="space-y-4">
          {sortedStudents.map((student, index) => (
            <GlassCard key={student.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`text-2xl font-display font-bold w-10 h-10 flex items-center justify-center rounded-full ${index < 3 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-white/20'}`}>
                  {index + 1}
                </div>
                <div className="text-4xl">{student.avatar}</div>
                <div>
                  <h3 className="text-xl font-display font-bold">{student.name}</h3>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Star size={24} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-2xl font-display font-bold">{student.stars}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={24} className="text-pink-400" />
                  <span className="text-2xl font-display font-bold">{student.medals.length}</span>
                </div>
              </div>
            </GlassCard>
          ))}
          {sortedStudents.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10">
              <p className="text-white/20 font-display font-bold text-xl italic">
                Nenhum explorador no ranking ainda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TeacherLoginView = ({ 
  setView, 
  teacherEmail, 
  setTeacherEmail, 
  teacherPassword, 
  setTeacherPassword, 
  showToast 
}: any) => {
  const handleTeacherLogin = () => {
    if (teacherEmail === 'maker.josesilva@educbarueri.sp.gov.br' && teacherPassword === '#Jose159632') {
      setView('teacher_dashboard');
      showToast('Bem-vindo de volta, Capitão Professor! 👨‍🏫');
    } else {
      showToast('Ops! E-mail ou senha errados. Tente de novo! 🤖', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#05050a] text-white relative">
      <div className="absolute top-20 left-20 w-64 h-64 bg-purple-600/10 blur-[100px]" />
      <GlassCard className="p-10 w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-blue-500" />
        
        <button onClick={() => setView('landing')} className="text-blue-400 mb-8 flex items-center gap-2 hover:text-blue-300 transition-all font-display font-bold">
          <ChevronLeft size={24} /> Voltar
        </button>
        
        <h2 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
          <ShieldCheck className="text-purple-400" size={32} /> Central de Comando
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-display font-bold text-blue-300/80 mb-2 ml-1">E-mail Espacial</label>
            <input 
              type="email" 
              value={teacherEmail}
              onChange={(e) => setTeacherEmail(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-purple-500 transition-all font-sans text-lg"
              placeholder="professor@galaxia.com"
            />
          </div>
          <div>
            <label className="block text-sm font-display font-bold text-blue-300/80 mb-2 ml-1">Código Secreto</label>
            <input 
              type="password" 
              value={teacherPassword}
              onChange={(e) => setTeacherPassword(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-purple-500 transition-all font-sans text-lg"
              placeholder="••••••••"
            />
          </div>
          <NeonButton onClick={handleTeacherLogin} variant="purple" className="w-full mt-4">
            Ativar Painel 🚀
          </NeonButton>
        </div>
      </GlassCard>
    </div>
  );
};

const TeacherDashboardView = ({ 
  setView, 
  students, 
  addStudent, 
  bulkAddStudents, 
  deleteAllStudents,
  updateStudent, 
  deleteStudent, 
  searchQuery, 
  setSearchQuery, 
  setEditingStudent 
}: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bulkData, setBulkData] = useState('');
  const [showBulk, setShowBulk] = useState(false);

  const filteredStudents = students.filter((s: any) => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#05050a] text-white p-4 md:p-8 font-sans relative overflow-x-hidden">
      {/* Background Glows - Fixed to prevent scrambling */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-pink-600/5 blur-[150px] -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-2xl border border-blue-500/30">
              <Users size={32} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-blue-400 glow-text">Painel do Capitão</h1>
              <p className="text-blue-200/40 font-medium">Comandando a jornada de {students.length} exploradores.</p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={() => setShowBulk(!showBulk)} 
              className="flex-1 md:flex-none px-6 py-3 bg-white/5 border-2 border-white/10 rounded-2xl text-blue-400 hover:bg-blue-500/10 transition-all font-display font-bold text-sm"
            >
              {showBulk ? '✨ Cadastro Único' : '📂 Importar Frota'}
            </button>
            {students.length > 0 && (
              <button 
                onClick={() => deleteAllStudents()} 
                className="flex-1 md:flex-none px-6 py-3 bg-red-500/10 border-2 border-red-500/20 rounded-2xl text-red-400 hover:bg-red-500/20 transition-all font-display font-bold text-sm"
                title="Remover todos os alunos"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={() => setView('landing')} className="flex items-center gap-2 px-6 py-3 bg-white/5 border-2 border-white/10 rounded-2xl text-white/60 hover:bg-white/10 transition-all font-display font-bold text-sm">
              <LogOut size={18} /> Sair
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Student Form */}
          <GlassCard className="p-8 h-fit sticky top-8">
            {showBulk ? (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                  <Award className="text-pink-500" /> Importar Frota
                </h2>
                <p className="text-sm text-blue-200/50 mb-4 leading-relaxed">
                  Cole sua lista de exploradores:<br/>
                  <code className="text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded">Nome, Email</code> (um por linha)<br/>
                  <span className="text-[10px] opacity-70 italic">Ex: João Silva, joao@escola.com</span>
                </p>
                <textarea 
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-all h-48 mb-6 resize-none text-sm font-mono"
                  placeholder="João Silva, joao@galaxia.com&#10;Maria Souza, maria@galaxia.com"
                />
                <NeonButton 
                  onClick={() => {
                    bulkAddStudents(bulkData);
                    setBulkData('');
                    setShowBulk(false);
                  }} 
                  variant="pink"
                  className="w-full"
                >
                  Lançar Frota! 🚀
                </NeonButton>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                  <Plus className="text-blue-500" /> Novo Explorador
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-display font-bold text-blue-300/80 mb-2 ml-1">Nome do Herói</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-blue-500 transition-all text-lg"
                      placeholder="Ex: João Estelar"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-display font-bold text-blue-300/80 mb-2 ml-1">E-mail de Contato</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-blue-500 transition-all text-lg"
                      placeholder="heroi@galaxia.com"
                    />
                  </div>
                  <NeonButton 
                    onClick={() => {
                      if (name && email) {
                        addStudent(name, email);
                        setName('');
                        setEmail('');
                      }
                    }} 
                    className="w-full mt-2"
                  >
                    Cadastrar Herói 🦸‍♂️
                  </NeonButton>
                </div>
              </motion.div>
            )}
          </GlassCard>

          {/* Students List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400/50 group-focus-within:text-blue-400 transition-colors" size={24} />
              <input 
                type="text" 
                placeholder="Localizar explorador na galáxia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] pl-14 pr-6 py-5 focus:outline-none focus:border-blue-500 transition-all text-xl font-display font-bold glow-border"
              />
            </div>

            <div className="grid grid-cols-1 gap-5">
              <AnimatePresence mode="popLayout">
                {filteredStudents.map((student: any) => (
                  <motion.div
                    key={student.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <GlassCard className="p-5 flex items-center justify-between group hover:border-blue-500/40 hover:bg-white/15">
                      <div className="flex items-center gap-5">
                        <div className="text-4xl bg-blue-500/10 w-16 h-16 flex items-center justify-center rounded-2xl border-2 border-white/10 group-hover:border-blue-500/50 transition-all shadow-inner">
                          {student.avatar}
                        </div>
                        <div>
                          <h3 className="text-xl font-display font-bold text-blue-100">{student.name}</h3>
                          <p className="text-sm font-medium text-blue-300/40">{student.email}</p>
                          {student.suggestion && (
                            <div className="flex items-center gap-2 mt-1 text-xs text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded-lg w-fit">
                              <Edit2 size={12} /> Sugestão pendente
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-1 bg-black/20 px-3 py-2 rounded-xl border border-white/5">
                          {[1, 2, 3].map(i => (
                            <Star 
                              key={i} 
                              size={20} 
                              className={i <= student.stars ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" : "text-white/5"} 
                            />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingStudent(student)}
                            className="p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-2xl text-blue-400 border border-blue-500/20 transition-all"
                            title="Gerenciar Conquistas"
                          >
                            <Settings size={22} />
                          </button>
                          <button 
                            onClick={() => deleteStudent(student.id)}
                            className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-2xl text-red-400 border border-red-500/20 transition-all"
                            title="Remover Explorador"
                          >
                            <Trash2 size={22} />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredStudents.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10"
                >
                  <Search size={48} className="mx-auto text-white/10 mb-4" />
                  <p className="text-white/20 font-display font-bold text-xl italic">
                    Nenhum explorador detectado neste setor.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentLoginView = ({ setView, loginEmail, setLoginEmail, handleStudentLogin }: any) => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-[#05050a] text-white relative">
    <div className="absolute bottom-20 right-20 w-64 h-64 bg-pink-600/10 blur-[100px]" />
    <GlassCard className="p-10 w-full max-w-md relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-blue-500" />
      
      <button onClick={() => setView('landing')} className="text-blue-400 mb-8 flex items-center gap-2 hover:text-blue-300 transition-all font-display font-bold">
        <ChevronLeft size={24} /> Voltar
      </button>
      
      <h2 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
        <UserCircle className="text-pink-400" size={32} /> Acesso Explorador
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-display font-bold text-blue-300/80 mb-2 ml-1">Seu E-mail de Herói</label>
          <input 
            type="email" 
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-pink-500 transition-all font-sans text-xl"
            placeholder="heroi@escola.com"
          />
        </div>
        <NeonButton onClick={handleStudentLogin} variant="pink" className="w-full mt-4">
          Iniciar Missão! 🚀
        </NeonButton>
      </div>
    </GlassCard>
  </div>
);

const StudentDashboardView = ({ currentStudent, setView, updateStudent, triggerConfetti, showToast }: any) => {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [suggestion, setSuggestion] = useState(currentStudent.suggestion || '');
  
  if (!currentStudent) return null;

  const updateAvatar = (avatar: string) => {
    updateStudent(currentStudent.id, { avatar });
  };

  const handleStarClick = (starIndex: number) => {
    let newStars = currentStudent.stars;
    if (starIndex === currentStudent.stars) {
      // Removing the last star
      newStars = starIndex - 1;
      showToast("Não fique triste, mas vamos nos comportar para ter sua estrela novamente! 💪", "error");
    } else if (starIndex > currentStudent.stars) {
      // Adding stars up to this index
      newStars = starIndex;
      triggerConfetti();
      showToast("Parabéns! Você é incrível e continua brilhando com suas estrelas! ✨");
    } else {
      // Clicking an already earned star that isn't the last one
      newStars = starIndex;
      showToast("Parabéns! Você continua com suas estrelas! ✨");
    }
    updateStudent(currentStudent.id, { stars: newStars });
  };

  const saveSuggestion = () => {
    updateStudent(currentStudent.id, { suggestion, suggestionStatus: 'pending' });
    showToast("Sugestão enviada para o Capitão Professor! 🚀");
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-white p-4 md:p-8 relative font-sans overflow-x-hidden">
      {/* Background Glows - Changed to fixed to prevent scrambling on scroll */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-pink-600/5 blur-[150px] -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-16 gap-8">
          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAvatarPicker(true)}
              className="relative group"
            >
              <div className="text-6xl md:text-7xl bg-white/10 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rounded-[2.5rem] border-2 border-white/20 group-hover:border-blue-400 transition-all shadow-[0_0_30px_rgba(59,130,246,0.2)] glow-border">
                {currentStudent.avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-500 p-2.5 rounded-2xl border-2 border-white/20 shadow-lg">
                <Edit2 size={18} />
              </div>
            </motion.button>
            <div>
              <p className="text-blue-400 font-display font-bold tracking-[0.2em] uppercase text-sm mb-2 glow-text">Explorador Estelar</p>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">{currentStudent.name}</h1>
            </div>
          </div>
          <button onClick={() => setView('landing')} className="p-4 bg-white/5 rounded-2xl border-2 border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all">
            <LogOut size={28} />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Stars Counter */}
          <GlassCard className="p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex gap-3 mb-6">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.3, rotate: 15 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => handleStarClick(i)}
                  className="cursor-pointer"
                  animate={i <= currentStudent.stars ? { 
                    scale: [1, 1.15, 1],
                    filter: ["drop-shadow(0 0 0px #fbbf24)", "drop-shadow(0 0 20px #fbbf24)", "drop-shadow(0 0 0px #fbbf24)"]
                  } : {}}
                  transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
                >
                  <Star 
                    size={56} 
                    className={i <= currentStudent.stars ? "text-yellow-400 fill-yellow-400" : "text-white/5"} 
                  />
                </motion.div>
              ))}
            </div>
            <h3 className="text-3xl font-display font-bold mb-1">{currentStudent.stars} Estrelas</h3>
            <p className="text-blue-200/40 font-medium text-sm">Poder de Brilho</p>
          </GlassCard>

          {/* Medals Summary */}
          <GlassCard className="p-10 flex flex-col items-center justify-center text-center md:col-span-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="bg-purple-500/20 p-6 rounded-[2rem] border-2 border-purple-500/30">
                  <Trophy size={72} className="text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
                </div>
                <div className="absolute -top-3 -right-3 bg-blue-500 text-sm font-display font-bold px-3 py-1.5 rounded-xl border-2 border-white/20 shadow-lg">
                  {currentStudent.medals.length}/12
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-3xl font-display font-bold mb-2">Coleção de Troféus</h3>
                <p className="text-blue-200/40 font-medium text-lg leading-relaxed">
                  Você já conquistou {currentStudent.medals.length} medalhas!<br/>
                  Faltam apenas {12 - currentStudent.medals.length} para completar o álbum.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Medals Grid */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-pink-500/20 p-2 rounded-xl border border-pink-500/30">
            <Award className="text-pink-400" size={24} />
          </div>
          <h2 className="text-2xl font-display font-bold glow-text">Suas Conquistas Lendárias</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-16">
          {MEDALS.map((medal, index) => {
            const earned = currentStudent.medals.includes(medal.id);
            return (
              <motion.div
                key={medal.id}
                initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                whileHover={{ 
                  scale: 1.1, 
                  rotateZ: earned ? [0, -5, 5, 0] : 0,
                  boxShadow: earned ? "0 0 40px rgba(59,130,246,0.4)" : "none"
                }}
                className={`relative p-6 rounded-[2rem] border-2 flex flex-col items-center justify-center text-center transition-all aspect-square cursor-default overflow-hidden ${
                  earned 
                  ? 'bg-gradient-to-br from-blue-600/30 to-purple-600/30 border-blue-400/50' 
                  : 'bg-white/5 border-white/10 grayscale opacity-30'
                }`}
              >
                {earned && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
                )}
                <motion.span 
                  animate={earned ? {
                    y: [0, -8, 0],
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{ repeat: Infinity, duration: 4, delay: index * 0.2 }}
                  className={`text-5xl mb-3 relative z-10 ${earned ? 'drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]' : ''}`}
                >
                  {medal.icon}
                </motion.span>
                <span className="text-[11px] font-display font-bold uppercase tracking-wider leading-tight relative z-10">
                  {medal.name}
                </span>
                {earned && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 z-10"
                  >
                    <div className="bg-blue-500 rounded-full p-1 border border-white/30">
                      <CheckCircle2 size={14} className="text-white" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Student Suggestion Section */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-500/20 p-2 rounded-xl border border-blue-500/30">
              <Edit2 className="text-blue-400" size={24} />
            </div>
            <h2 className="text-2xl font-display font-bold glow-text">Espaço de Sugestões</h2>
          </div>
          <GlassCard className="p-8">
            <p className="text-blue-200/60 mb-6 font-medium">
              Tem alguma ideia para nossa Trilha Digital? Escreva aqui para o professor!
            </p>
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Eu gostaria de aprender sobre..."
              className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500 transition-all min-h-[120px] mb-6 text-lg font-sans resize-none"
            />
            {currentStudent.suggestion && (
              <div className={`mb-6 p-4 rounded-xl border-2 flex items-center gap-3 ${
                currentStudent.suggestionStatus === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                currentStudent.suggestionStatus === 'denied' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}>
                {currentStudent.suggestionStatus === 'approved' ? <CheckCircle2 size={20} /> : 
                 currentStudent.suggestionStatus === 'denied' ? <X size={20} /> : 
                 <Bell size={20} />}
                <span className="font-bold">
                  Status da Sugestão: {
                    currentStudent.suggestionStatus === 'approved' ? 'Aprovada! 🎉' :
                    currentStudent.suggestionStatus === 'denied' ? 'Não aprovada. Tente outra ideia! 💡' :
                    'Aguardando resposta do Professor... ⏳'
                  }
                </span>
              </div>
            )}
            <NeonButton onClick={saveSuggestion} className="w-full sm:w-auto">
              Enviar Sugestão 🚀
            </NeonButton>
          </GlassCard>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAvatarPicker(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg"
            >
              <GlassCard className="p-8">
                <h2 className="text-2xl font-display font-bold mb-6 text-center text-blue-400">Escolha seu Avatar</h2>
                <div className="grid grid-cols-5 gap-4">
                  {AVATARS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        updateAvatar(emoji);
                        setShowAvatarPicker(false);
                      }}
                      className={`text-4xl p-3 rounded-2xl hover:bg-white/10 transition-all ${
                        currentStudent.avatar === emoji ? 'bg-blue-600/30 border-2 border-blue-500' : 'border-2 border-transparent'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#a855f7', '#ec4899', '#fbbf24']
    });
  };

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('trilha_digital_students');
    if (saved) {
      setStudents(JSON.parse(saved));
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('trilha_digital_students', JSON.stringify(students));
    // Update current student if they are in the list
    if (currentStudent) {
      const updated = students.find(s => s.id === currentStudent.id);
      if (updated) setCurrentStudent(updated);
    }
  }, [students]);

  // --- Teacher Logic ---

  const addStudent = (name: string, email: string) => {
    if (students.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      showToast('Este e-mail já está cadastrado!', 'error');
      return;
    }
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name,
      email,
      stars: 0,
      medals: [],
      avatar: AVATARS[0]
    };
    setStudents(prev => [...prev, newStudent]);
    showToast(`Explorador ${name} recrutado com sucesso! 🚀`);
  };

  const bulkAddStudents = (data: string) => {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const newStudents: Student[] = [];
    let addedCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    // Track emails already in the new batch to avoid internal duplicates
    const batchEmails = new Set<string>();

    lines.forEach(line => {
      // Try to split by common separators
      let parts = line.split(/[,;\t]/).map(p => p.trim());
      
      // If only one part, maybe they just put Name and Email separated by space at the end?
      // Or maybe they just put the name?
      if (parts.length < 2) {
        // Try to find an email-like string at the end
        const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
          const email = emailMatch[0];
          const name = line.replace(email, '').trim();
          parts = [name, email];
        }
      }

      if (parts.length >= 2) {
        const name = parts[0];
        const email = parts[1].toLowerCase();
        
        const isDuplicateInSystem = students.some(s => s.email.toLowerCase() === email);
        const isDuplicateInBatch = batchEmails.has(email);

        if (name && email && !isDuplicateInSystem && !isDuplicateInBatch) {
          newStudents.push({
            id: crypto.randomUUID(),
            name,
            email,
            stars: 0,
            medals: [],
            avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)]
          });
          batchEmails.add(email);
          addedCount++;
        } else if (isDuplicateInSystem || isDuplicateInBatch) {
          duplicateCount++;
        } else {
          invalidCount++;
        }
      } else {
        invalidCount++;
      }
    });

    if (newStudents.length > 0) {
      setStudents(prev => [...prev, ...newStudents]);
      let msg = `${addedCount} novos exploradores recrutados! ✨`;
      if (duplicateCount > 0) msg += ` (${duplicateCount} duplicados ignorados)`;
      showToast(msg);
      triggerConfetti();
    } else {
      if (duplicateCount > 0) {
        showToast('Todos os e-mails já estão na frota.', 'error');
      } else {
        showToast('Formato inválido. Use: Nome, Email', 'error');
      }
    }
  };

  const deleteAllStudents = () => {
    if (students.length === 0) return;
    if (confirm(`⚠️ ATENÇÃO: Deseja remover TODOS os ${students.length} exploradores? Esta ação não pode ser desfeita.`)) {
      setStudents([]);
      showToast('Frota reiniciada. Todos os exploradores foram removidos.', 'error');
    }
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteStudent = (id: string) => {
    const student = students.find(s => s.id === id);
    if (confirm(`Deseja mesmo remover o explorador ${student?.name} da frota?`)) {
      setStudents(prev => prev.filter(s => s.id !== id));
      showToast(`Explorador removido do sistema.`, 'error');
    }
  };

  // --- Student Logic ---

  const handleStudentLogin = () => {
    const student = students.find(s => s.email.toLowerCase() === loginEmail.toLowerCase());
    if (student) {
      setCurrentStudent(student);
      setView('student_dashboard');
      showToast(`Bem-vindo, ${student.name}! Missão iniciada. 🚀`);
    } else {
      showToast('E-mail não encontrado. Fale com seu Capitão Professor! 🤖', 'error');
    }
  };

  return (
    <div className="font-sans selection:bg-blue-500 selection:text-white">
      <FloatingParticles />
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
      
      {view === 'landing' && <LandingView setView={setView} />}
      
      {view === 'teacher_login' && (
        <TeacherLoginView 
          setView={setView} 
          teacherEmail={teacherEmail} 
          setTeacherEmail={setTeacherEmail}
          teacherPassword={teacherPassword}
          setTeacherPassword={setTeacherPassword}
          showToast={showToast}
        />
      )}
      
      {view === 'teacher_dashboard' && (
        <TeacherDashboardView 
          setView={setView}
          students={students}
          addStudent={addStudent}
          bulkAddStudents={bulkAddStudents}
          deleteAllStudents={deleteAllStudents}
          updateStudent={updateStudent}
          deleteStudent={deleteStudent}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setEditingStudent={setEditingStudent}
        />
      )}
      
      {view === 'student_login' && (
        <StudentLoginView 
          setView={setView}
          loginEmail={loginEmail}
          setLoginEmail={setLoginEmail}
          handleStudentLogin={handleStudentLogin}
        />
      )}
      
      {view === 'student_dashboard' && (
        <StudentDashboardView 
          currentStudent={currentStudent}
          setView={setView}
          updateStudent={updateStudent}
          triggerConfetti={triggerConfetti}
          showToast={showToast}
        />
      )}

      {view === 'ranking' && (
        <RankingView 
          students={students}
          setView={setView}
        />
      )}

      {/* Global Modals */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingStudent(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl"
            >
              <GlassCard className="p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-display font-bold text-blue-400 glow-text">Gerenciar Explorador</h2>
                  <button onClick={() => setEditingStudent(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                    <LogOut size={24} />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-4xl">{editingStudent.avatar}</div>
                  <div>
                    <div className="text-xl font-display font-bold">{editingStudent.name}</div>
                    <div className="text-sm text-blue-300/40">{editingStudent.email}</div>
                  </div>
                </div>

                <div className="space-y-10">
                  <div>
                    <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-3">
                      <Star className="text-yellow-400" /> Estrelas de Brilho
                    </h3>
                    <div className="flex gap-4">
                      {[0, 1, 2, 3].map(num => (
                        <button
                          key={num}
                          onClick={() => {
                            const isNewThreeStars = num === 3 && editingStudent.stars < 3;
                            updateStudent(editingStudent.id, { stars: num });
                            setEditingStudent({ ...editingStudent, stars: num });
                            if (isNewThreeStars) {
                              triggerConfetti();
                              showToast(`${editingStudent.name} alcançou o Brilho Máximo! ⭐⭐⭐`);
                            }
                          }}
                          className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-display font-bold transition-all ${
                            editingStudent.stars === num 
                            ? 'bg-blue-500 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] text-white' 
                            : 'bg-white/5 border-white/10 hover:border-white/30 text-white/40'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-3">
                      <Trophy className="text-purple-400" /> Medalhas de Missão
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {MEDALS.map(medal => {
                        const isEarned = editingStudent.medals.includes(medal.id);
                        return (
                          <button
                            key={medal.id}
                            onClick={() => {
                              const isEarned = editingStudent.medals.includes(medal.id);
                              const newMedals = isEarned 
                                ? editingStudent.medals.filter(id => id !== medal.id)
                                : [...editingStudent.medals, medal.id];
                              
                              if (!isEarned) {
                                triggerConfetti();
                                showToast(`Medalha "${medal.name}" desbloqueada! 🏆`);
                              }
                              
                              updateStudent(editingStudent.id, { medals: newMedals });
                              setEditingStudent({ ...editingStudent, medals: newMedals });
                            }}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                              isEarned 
                              ? 'bg-purple-500/20 border-purple-500/50 text-purple-200' 
                              : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                            }`}
                          >
                            <span className="text-3xl">{medal.icon}</span>
                            <span className="text-sm font-display font-bold leading-tight">{medal.name}</span>
                            {isEarned && <CheckCircle2 size={20} className="ml-auto text-purple-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {editingStudent.suggestion && (
                    <div className="p-6 bg-blue-500/10 rounded-2xl border-2 border-blue-500/20">
                      <h3 className="text-xl font-display font-bold mb-3 flex items-center gap-3 text-blue-400">
                        <Edit2 size={20} /> Sugestão do Explorador
                      </h3>
                      <p className="text-blue-100 italic leading-relaxed mb-6">
                        "{editingStudent.suggestion}"
                      </p>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => {
                            updateStudent(editingStudent.id, { suggestionStatus: 'approved' });
                            setEditingStudent({ ...editingStudent, suggestionStatus: 'approved' });
                            showToast("Sugestão aprovada! ✅");
                          }}
                          className={`flex-1 py-3 rounded-xl font-display font-bold transition-all border-2 ${editingStudent.suggestionStatus === 'approved' ? 'bg-emerald-500 border-emerald-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'}`}
                        >
                          Aprovar ✅
                        </button>
                        <button 
                          onClick={() => {
                            updateStudent(editingStudent.id, { suggestionStatus: 'denied' });
                            setEditingStudent({ ...editingStudent, suggestionStatus: 'denied' });
                            showToast("Sugestão negada. ❌");
                          }}
                          className={`flex-1 py-3 rounded-xl font-display font-bold transition-all border-2 ${editingStudent.suggestionStatus === 'denied' ? 'bg-red-500 border-red-400' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'}`}
                        >
                          Negar ❌
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
