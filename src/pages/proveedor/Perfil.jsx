import { useState } from 'react';
import {
  Camera, Shield, Leaf, CheckCircle2, Building2, ShieldCheck, FileCheck, Star, Clock, AlertCircle,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import FormGroup, { Input } from '../../components/ui/FormGroup';
import { HeroBadge, SectionHeader, ComplianceItem } from './provShared';
import { ORA, GREEN, WARN, ERR } from './provData';
import { useAuthStore } from '../../stores/authStore';

function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(w => w.length > 1);
  if (!words.length) return 'TG';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const SCORE_PROV = 690;
const scoreZone = SCORE_PROV < 400 ? { label: 'Crítico', color: ERR }
  : SCORE_PROV < 600 ? { label: 'Alto',  color: ORA }
  : SCORE_PROV < 750 ? { label: 'Medio', color: WARN }
  : { label: 'Bajo', color: GREEN };
const KYC_VENC    = '31/12/2026';
const ULTIMA_AUD  = '10/04/2026';

export default function ProvPerfil() {
  const session  = useAuthStore(s => s.session);
  const user     = session?.user ?? {};
  const fullName = user.fullName || 'TransGE S.L.';
  const email    = user.email    ?? 'info@transge.gq';
  const initials = getInitials(fullName);

  const [avatar, setAvatar] = useState(null);

  return (
    <AppShell active="provPerfil" role="proveedor" title="Mi Perfil" sub="Información de cuenta" back>
      <div className="fade-in space-y-5">

        {/* ── Hero card ── */}
        <div className="card-enter bg-white rounded-[14px] border border-border p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">

            {/* Avatar */}
            <div className="relative shrink-0 self-center sm:self-start">
              <div className="w-24 h-24 rounded-[20px] overflow-hidden">
                {avatar
                  ? <img src={avatar} alt="Logo empresa" loading="lazy" className="w-full h-full object-cover" />
                  : <div className="bona-gradient-bg w-full h-full flex items-center justify-center text-white font-bold text-[28px]">{initials}</div>
                }
              </div>
              <label className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white border border-border shadow-sm flex items-center justify-center cursor-pointer hover:bg-page-bg transition"
                     title="Cambiar logo">
                <Camera className="w-3.5 h-3.5 text-text-3" />
                <input type="file" className="hidden" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) setAvatar(URL.createObjectURL(file));
                }} />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-[20px] font-bold text-text-1 leading-tight">{fullName}</div>
              {email && <div className="text-[13px] text-text-3 mt-0.5">{email}</div>}
              <div className="text-[12px] font-mono text-text-5 mt-0.5">GE-2020-00445</div>
              <div className="text-[11px] text-text-4 mt-1">Transporte · 10–50 empleados</div>
            </div>

            {/* Score */}
            <div className="shrink-0 flex flex-col items-center sm:items-end">
              <div className="text-[9px] font-bold uppercase tracking-widest text-text-4 mb-1">Score Crediticio</div>
              <div className="text-[32px] sm:text-[48px] font-extrabold leading-none" style={{ color: scoreZone.color }}>{SCORE_PROV}</div>
              <div className="text-[11px] text-text-4 mt-1.5">
                / 1000 · <span className="font-semibold" style={{ color: scoreZone.color }}>Riesgo {scoreZone.label}</span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="border-t border-border mt-5 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <HeroBadge label="Nivel de Riesgo"  value="Bajo"      Icon={Shield}       bg="#E3F4EA" color="#2E7D5B" />
            <HeroBadge label="Calificación ESG"  value="Verde Bonafide" Icon={Leaf}    bg="#E3F4EA" color="#2E7D5B" />
            <HeroBadge label="Estado KYC"        value="Vigente"   Icon={CheckCircle2} bg="#E3F4EA" color="#2E7D5B" />
          </div>
        </div>

        {/* ── Datos + Compliance ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Datos de la empresa */}
          <div className="card-enter bg-white rounded-[14px] border border-border p-6" style={{ animationDelay: '70ms' }}>
            <SectionHeader
              title="Datos de la empresa"
              sub="Información registrada. Contacta con Bonafide para modificaciones."
              Icon={Building2}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup label="Razón Social">
                <Input value={fullName} disabled />
              </FormGroup>
              <FormGroup label="RUC / NIF">
                <Input value="GE-2020-00445" disabled />
              </FormGroup>
              <FormGroup label="Sector Productivo">
                <Input value="Transporte" disabled />
              </FormGroup>
              <FormGroup label="Número de empleados">
                <Input value="10 – 50" disabled />
              </FormGroup>
              <FormGroup label="Teléfono corporativo">
                <Input value="+240 222 333 444" disabled />
              </FormGroup>
              <FormGroup label="Correo corporativo">
                <Input value={email} disabled />
              </FormGroup>
            </div>
          </div>

          {/* Compliance / KYC */}
          <div className="card-enter bg-white rounded-[14px] border border-border p-6" style={{ animationDelay: '140ms' }}>
            <SectionHeader
              title="Compliance & KYC"
              sub="Estado regulatorio y de cumplimiento normativo de la empresa."
              Icon={ShieldCheck}
              right={
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-[8px] shrink-0"
                      style={{ background: '#E3F4EA', color: '#2E7D5B', border: '1px solid #A8D5BE' }}>
                  Aprobado
                </span>
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ComplianceItem
                label="KYC" value="Vigente"
                sub={<>Vence el <span className="font-semibold text-text-2">{KYC_VENC}</span></>}
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
                Icon={FileCheck} iconBg="#FFF3E0" iconColor="#EF7A2C"
              />
              <ComplianceItem
                label="Nivel Compliance" value="A"
                sub="Calificación de cumplimiento normativo"
                Icon={Star} iconBg="#FFF3E0" iconColor="#EF7A2C"
              />
              <ComplianceItem
                label="Última Auditoría" value={ULTIMA_AUD}
                sub={<>Próxima revisión en <span className="font-semibold text-text-2">Oct 2026</span></>}
                Icon={Clock} iconBg="#FFF3E0" iconColor="#EF7A2C"
              />
              <ComplianceItem
                label="Firma Digital" value="Pendiente"
                sub="Renovación de firma digital requerida"
                Icon={AlertCircle} iconBg="#FFF3E0" iconColor="#EF7A2C"
              />
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
