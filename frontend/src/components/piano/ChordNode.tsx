import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export default function ChordNode({ id, data, isConnectable }: any) {
  const isGhost = data.isGhost;
  
  let borderColor = 'border-green-500';
  let textColor = 'text-green-400';
  let hoverBg = 'hover:bg-green-500/10';
  let glowColor = 'shadow-[0_0_20px_rgba(34,197,94,0.3)]';
  let hoverGlowColor = 'hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]';
  let handleColor = 'bg-green-500';

  if (data.colorType === 'minor') {
    borderColor = 'border-blue-500';
    textColor = 'text-blue-400';
    hoverBg = 'hover:bg-blue-500/10';
    glowColor = 'shadow-[0_0_20px_rgba(59,130,246,0.3)]';
    hoverGlowColor = 'hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]';
    handleColor = 'bg-blue-500';
  } else if (data.colorType === 'diminished') {
    borderColor = 'border-purple-500';
    textColor = 'text-purple-400';
    hoverBg = 'hover:bg-purple-500/10';
    glowColor = 'shadow-[0_0_20px_rgba(168,85,247,0.3)]';
    hoverGlowColor = 'hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]';
    handleColor = 'bg-purple-500';
  } else if (data.colorType === 'dominant') {
    borderColor = 'border-orange-500';
    textColor = 'text-orange-400';
    hoverBg = 'hover:bg-orange-500/10';
    glowColor = 'shadow-[0_0_20px_rgba(249,115,22,0.3)]';
    hoverGlowColor = 'hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]';
    handleColor = 'bg-orange-500';
  }

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`group relative w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 transition-all hover:scale-110
        ${isGhost 
          ? `border-dashed ${borderColor} bg-white dark:bg-black/60 ${textColor} opacity-60 hover:opacity-100 hover:border-solid ${hoverBg} cursor-pointer shadow-none` 
          : `bg-white dark:bg-black ${data.isPlaying ? 'border-white scale-110 shadow-[0_0_50px_rgba(255,255,255,1)] z-50' : `${borderColor} ${glowColor}`} text-zinc-900 dark:text-white ${hoverGlowColor} cursor-grab`
        }
      `}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable} 
        className={`w-3 h-3 border-none ${isGhost ? 'bg-transparent' : handleColor}`}
      />
      
      {!isGhost && data.onDelete && (
         <button 
           onClick={(e) => { e.stopPropagation(); data.onDelete(id); }}
           className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-zinc-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
         >
           <Trash2 className="w-3 h-3" />
         </button>
      )}

      <span className={`text-2xl font-black ${isGhost ? '' : 'text-zinc-900 dark:text-white'}`}>{data.root}</span>
      <span className={`text-xs font-bold mt-1 ${isGhost ? '' : textColor}`}>{data.quality}</span>
      
      {!isGhost && (
        <Handle 
          type="source" 
          position={Position.Right} 
          isConnectable={isConnectable}
          className={`w-4 h-4 bg-white border-2 ${borderColor} shadow-[0_0_10px_rgba(255,255,255,0.8)]`}
        />
      )}
    </motion.div>
  );
}
