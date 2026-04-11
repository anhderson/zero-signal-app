import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Check, Clock, StickyNote, ListChecks, 
  ChevronUp, ChevronDown, Eye, EyeOff, Palette 
} from 'lucide-react';
import { useAppStore } from '../store';
import './SidebarWidgets.css';

// ---- Sound helper ----
const playAlarmSound = () => {
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Sci-fi notification
    audio.play();
  } catch (err) {
    console.error("Audio error", err);
  }
};

export const SidebarWidgets = () => {
  const { 
    activeProjectId, notes, tasks, 
    addNote, updateNote, deleteNote,
    addTask, toggleTask, deleteTask, moveTask, uncheckAllTasks 
  } = useAppStore();

  const [taskTitle, setTaskTitle] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskColor, setTaskColor] = useState('var(--neon-cyan)');
  const [noteColor, setNoteColor] = useState('var(--neon-cyan)'); // Color for new notes
  const [showNoteColors, setShowNoteColors] = useState(false); // Toggle color picker
  const [showTasks, setShowTasks] = useState(false); // Hidden by default
  const [showNotes, setShowNotes] = useState(false); // Hidden by default
  const [widgetDesign, setWidgetDesign] = useState(() => {
    const saved = localStorage.getItem('zs_widget_design');
    return saved ? parseInt(saved, 10) : 4; // Default to 4 (Cyan)
  }); 

  const colors = [
    '#ff3131', // Vermelho Neon
    '#ff8800', // Laranja Neon
    '#faff00', // Amarelo Neon
    '#00ff41', // Verde Neon
    '#00f3ff', // Ciano/Azul Neon
    '#7b00ff', // Indigo Neon
    '#f000ff'  // Violeta/Magenta Neon
  ];

  const projectNotes = notes.filter(n => n.projectId === activeProjectId);
  const projectTasks = tasks.filter(t => t.projectId === activeProjectId);

  // ---- Alarm Checker ----
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      projectTasks.forEach(task => {
        if (!task.completed && task.alarmTime === currentTime && now.getSeconds() === 0) {
          playAlarmSound();
          alert(`ALERTA: ${task.title}\n${task.description || ''}`);
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [projectTasks]);

  // ---- Persist Design ----
  useEffect(() => {
    localStorage.setItem('zs_widget_design', widgetDesign.toString());
  }, [widgetDesign]);

  if (!activeProjectId) return null;

  return (
    <div className={`sidebar-widgets design-${widgetDesign}`}>
      
      {/* ---- NOTEPAD SECTION ---- */}
      <div className="widget-section sticky-board">
        <div className="widget-header">
          <StickyNote size={14} className="widget-header-icon" />
          <span>Espaço de anotações</span>
          
          <div className="header-actions">
            <button 
              className="toggle-vis-btn" 
              onClick={() => setShowNotes(!showNotes)}
              title={showNotes ? "Ocultar Notas" : "Mostrar Notas"}
            >
              {showNotes ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        
        {showNotes && (
          <>
            <div className="notes-container">
              {projectNotes.map(note => (
                <div key={note.id} className="sticky-note" style={{ '--note-color': note.color } as any}>
                  <textarea 
                    value={note.content} 
                    onChange={(e) => updateNote(note.id, e.target.value)}
                    placeholder="Escreva algo..."
                  />
                  <button className="delete-note-btn" onClick={() => deleteNote(note.id)}>
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>

            <div className="add-note-inline">
              {showNoteColors && (
                <div className="color-selector">
                  {colors.map(c => (
                    <div 
                      key={c} 
                      className={`color-dot ${noteColor === c ? 'active' : ''}`}
                      style={{ backgroundColor: c, boxShadow: `0 0 5px ${c}` }}
                      onClick={() => setNoteColor(c)}
                    />
                  ))}
                </div>
              )}
              
              <button onClick={() => {
                if (!showNoteColors) {
                  setShowNoteColors(true);
                } else {
                  addNote(activeProjectId, '', noteColor);
                  setShowNoteColors(false);
                }
              }}>
                <Plus size={14} /> {showNoteColors ? 'Confirmar Nota' : 'Nova Nota'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ---- TASK LIST SECTION ---- */}
      <div className="widget-section task-board">
        <div className="widget-header">
          <ListChecks size={14} className="widget-header-icon" />
          <span>Quest´s Diárias</span>
          
          <div className="header-actions stacked">
            <button 
              className="toggle-vis-btn" 
              onClick={() => setShowTasks(!showTasks)}
              title={showTasks ? "Ocultar Quest´s" : "Mostrar Quest´s"}
            >
              {showTasks ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>

            <button 
              className="design-toggle-btn" 
              onClick={() => setWidgetDesign((widgetDesign + 1) % 9)}
              title="Trocar Design Visual"
            >
              <Palette size={14} />
            </button>
          </div>
        </div>

        {showTasks && (
          <>
            <div className="task-expanded-controls">
              <button 
                className="reset-tasks-btn" 
                onClick={() => uncheckAllTasks(activeProjectId)}
                title="Desmarcar todas as Quest´s"
              >
                Resetar Tudo
              </button>
            </div>

            <div className="task-input-row">
              <input 
                type="text" 
                placeholder="Nova tarefa..." 
                value={taskTitle} 
                onChange={e => setTaskTitle(e.target.value)} 
                onKeyDown={e => {
                  if (e.key === 'Enter' && taskTitle.trim()) {
                      addTask(activeProjectId, { 
                        title: taskTitle.trim(), 
                        color: taskColor,
                        alarmTime: taskTime || undefined
                      });
                    setTaskTitle('');
                    setTaskTime('');
                  }
                }}
              />
              <div className="time-confirm-row">
                <input 
                  type="time" 
                  value={taskTime} 
                  onChange={e => setTaskTime(e.target.value)} 
                  title="Definir Alarme"
                  step="1" // Allow seconds just in case, though I check HH:MM
                />

                <button 
                  className="confirm-task-btn" 
                  onClick={() => {
                      if (taskTitle.trim()) {
                        addTask(activeProjectId, { 
                          title: taskTitle.trim(), 
                          color: taskColor,
                          alarmTime: taskTime || undefined
                        });
                        setTaskTitle('');
                        setTaskTime('');
                      }
                  }}
                  title="Confirmar Quest"
                >
                  <Check size={18} />
                </button>
              </div>

              <div className="color-selector">
                {colors.map(c => (
                  <div 
                    key={c} 
                    className={`color-dot ${taskColor === c ? 'active' : ''}`}
                    style={{ backgroundColor: c, boxShadow: `0 0 5px ${c}` }}
                    onClick={() => setTaskColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="tasks-list">
              {projectTasks.map((task, index) => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`} style={{ '--task-color': task.color } as any}>
                  <div className="task-move-controls">
                    <button onClick={() => moveTask(task.id, -1)} disabled={index === 0}><ChevronUp size={12} /></button>
                    <button onClick={() => moveTask(task.id, 1)} disabled={index === projectTasks.length - 1}><ChevronDown size={12} /></button>
                  </div>

                  <div className="task-check" onClick={() => toggleTask(task.id)}>
                    {task.completed ? <Check size={12} /> : null}
                  </div>
                  <div className="task-content">
                    <span className="task-title">{task.title}</span>
                    {task.alarmTime && (
                      <span className="task-alarm">
                        <Clock size={10} /> {task.alarmTime}
                      </span>
                    )}
                  </div>
                  <button className="delete-task-btn" onClick={() => deleteTask(task.id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
};
