import { useState } from 'react';
import {
  Camera, Shield, Leaf, Star, TrendingUp, CheckCircle2,
  Clock, FileCheck, AlertCircle, BadgeCheck,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import FormGroup, { Input } from '../../components/ui/FormGroup';

const SCORE            = 82;
const KYC_VENCIMIENTO  = '31/12/2026';
const ULTIMA_AUDITORIA = '15/03/2026';

const StatBadge = ({ label, value, Icon, bg, color }) => (
  <div className="rounded-[10px] px-3 py-2.5" style={{ background: bg }}>
    <div className="flex items-center gap-1 mb-1">
      <Icon className="w-3 h-3 shrink-0" style={{ color }} />
      <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color }}>{label}</span>
    </div>
    <div className="text-[15px] font-extrabold leading-none" style={{ color }}>{value}</div>
  </div>
);

const ComplianceItem = ({ label, value, sub, Icon, iconBg, iconColor }) => (
  <div className="rounded-[12px] border border-border p-4">
    <div className="flex items-center gap-2.5 mb-2.5">
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <div>
        <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide">{label}</div>
        <div className="text-[13px] font-bold leading-tight" style={{ color: iconColor }}>{value}</div>
      </div>
    </div>
    <div className="text-[11px] text-text-4 leading-snug">{sub}</div>
  </div>
);

export default function EpPerfil() {
  const { go } = useApp();
  const [avatar, setAvatar] = useState(null);

  return (
    <AppShell active="epPerfil" role="empresa-pequena" title="Mi Perfil" sub="Información de cuenta">
      <div className="fade-in space-y-5">

        {/* ── Hero card ── */}
        <div className="bg-white rounded-[14px] border border-border p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">

            {/* Avatar con botón de upload */}
            <div className="relative shrink-0 self-center sm:self-start">
              <div className="w-24 h-24 rounded-[20px] overflow-hidden">
                {avatar
                  ? <img src={avatar} alt="Logo empresa" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-white font-bold text-[28px]"
                         style={{ background: 'linear-gradient(135deg, #E0201C, #EF7A2C)' }}>CS</div>
                }
              </div>
              <label className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white border border-border shadow-sm flex items-center justify-center cursor-pointer hover:bg-page-bg transition"
                     title="Cambiar foto o logo">
                <Camera className="w-3.5 h-3.5 text-text-3" />
                <input type="file" className="hidden" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) setAvatar(URL.createObjectURL(file));
                }} />
              </label>
            </div>

            {/* Info empresa */}
            <div className="flex-1 min-w-0">
              <div className="text-[20px] font-bold text-text-1 leading-tight">Construcciones Silva Ltd.</div>
              <div className="text-[13px] text-text-3 mt-0.5">Carlos Esono Mbá · Director General</div>
              <div className="text-[12px] font-mono text-text-5 mt-0.5">GE-2021-00234</div>
              <div className="text-[11px] text-text-4 mt-1">Construcción · 11–25 empleados</div>
            </div>

            {/* Badges — esquina derecha */}
            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto shrink-0">
              <StatBadge label="Score"    value={SCORE}    Icon={TrendingUp}  bg="#E3F4EA" color="#2E7D5B" />
              <StatBadge label="Riesgo"   value="Bajo"     Icon={Shield}      bg="#E3F4EA" color="#2E7D5B" />
              <StatBadge label="ESG"      value="Verde"    Icon={Leaf}        bg="#E3F4EA" color="#2E7D5B" />
              <StatBadge label="KYC"      value="Vigente"  Icon={CheckCircle2}bg="#E3F4EA" color="#2E7D5B" />
              <StatBadge label="Rating"   value="AA"       Icon={Star}        bg="#EFF6FF" color="#3B82F6" />
              <StatBadge label="Bonafide" value="Verde"    Icon={BadgeCheck}  bg="#FDEEEB" color="#E0201C" />
            </div>
          </div>
        </div>

        {/* ── Datos de la empresa ── */}
        <div className="bg-white rounded-[14px] border border-border p-6">
          <div className="mb-5">
            <div className="text-[14px] font-bold text-text-1">Datos de la empresa</div>
            <div className="text-[12px] text-text-4">Información registrada en la plataforma. Contacta con Bonafide para solicitar modificaciones.</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <FormGroup label="Razón Social">
              <Input value="Construcciones Silva Ltd." disabled />
            </FormGroup>
            <FormGroup label="RUC / NIF">
              <Input value="GE-2021-00234" disabled />
            </FormGroup>
            <FormGroup label="Sector Productivo">
              <Input value="Construcción" disabled />
            </FormGroup>
            <FormGroup label="Número de empleados">
              <Input value="11 – 25" disabled />
            </FormGroup>
            <FormGroup label="Teléfono corporativo">
              <Input value="+240 222 456 789" disabled />
            </FormGroup>
            <FormGroup label="Correo corporativo">
              <Input value="carlos@construccionessilva.gq" disabled />
            </FormGroup>
          </div>
        </div>

        {/* ── Compliance / KYC ── */}
        <div className="bg-white rounded-[14px] border border-border p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="text-[14px] font-bold text-text-1">Compliance & KYC</div>
              <div className="text-[12px] text-text-4">Estado regulatorio y de cumplimiento normativo de la empresa.</div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1.5 rounded-[8px] shrink-0"
                  style={{ background: '#E3F4EA', color: '#2E7D5B', border: '1px solid #A8D5BE' }}>
              Aprobado
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ComplianceItem
              label="KYC" value="Vigente"
              sub={<>Vence el <span className="font-semibold text-text-2">{KYC_VENCIMIENTO}</span></>}
              Icon={CheckCircle2} iconBg="#E3F4EA" iconColor="#2E7D5B"
            />
            <ComplianceItem
              label="AML" value="Aprobado"
              sub="Sin alertas de lavado de activos"
              Icon={Shield} iconBg="#E3F4EA" iconColor="#2E7D5B"
            />
            <ComplianceItem
              label="Documentos" value="4 / 4"
              sub="Todos los documentos verificados"
              Icon={FileCheck} iconBg="#EFF6FF" iconColor="#3B82F6"
            />
            <ComplianceItem
              label="Nivel Compliance" value="AA"
              sub="Calificación de cumplimiento normativo"
              Icon={Star} iconBg="#EFF6FF" iconColor="#3B82F6"
            />
            <ComplianceItem
              label="Última Auditoría" value={ULTIMA_AUDITORIA}
              sub={<>Próxima revisión en <span className="font-semibold text-text-2">Sep 2026</span></>}
              Icon={Clock} iconBg="#FDF6E8" iconColor="#C68A1D"
            />
            <ComplianceItem
              label="Firma Digital" value="Pendiente"
              sub="Renovación de firma digital requerida"
              Icon={AlertCircle} iconBg="#FDF6E8" iconColor="#C68A1D"
            />
          </div>
        </div>

      </div>
    </AppShell>
  );
}
