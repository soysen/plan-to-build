import React, { useState } from 'react';
import { Popover } from '@base-ui/react/popover';
import { Copy, Check } from 'lucide-react';

interface ResumeCopyButtonProps {
  resumeEntry?: string;
  projectPath: string;
}

export const ResumeCopyButton: React.FC<ResumeCopyButtonProps> = ({ resumeEntry, projectPath }) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const textToCopy = resumeEntry || `Start here: .github/worklog/agent-status.md in ${projectPath}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setOpen(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 2000);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer focus:outline-none"
        title="複製 Handoff / Resume Entry"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
        <span>{copied ? '已複製！' : 'Resume Entry'}</span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="top" align="center" sideOffset={6}>
          <Popover.Popup className="glass-panel px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-300 border border-emerald-500/40 shadow-xl shadow-emerald-950/80 flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>已成功複製至剪貼簿！</span>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};
