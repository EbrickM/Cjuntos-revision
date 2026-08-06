import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

// ── PROVEEDORES ──
export default function EmpProv() {
  const { go } = useApp();

  const provs = [
    ['Const. Silva','CS','Construcción','45 emp.','b-green','🟢 Verde','87'],
    ['Tech Bata SL','TB','Tecnología','12 emp.','b-green','🟢 Verde','82'],
    ['LogiGE S.A.','LG','Transporte','28 emp.','b-green','🟢 Verde','79'],
    ['AgriEco PYME','AE','Agricultura','8 emp.','b-yellow','⚠ Amarillo','61'],
    ['Mader. Bata','MB','Maderería','23 emp.','b-green','🟢 Verde','75'],
    ['ServLog GE','SL','Logística','15 emp.','b-red','🔴 Rojo','32'],
  ];

  return (
    <AppShell active="empProv" role="contratante" title="Proveedores" sub="Directorio">
      <div className="fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {provs.map(([name,ini,sec,emp,cls,sem,score]) => (
            <div key={name} onClick={() => go('empProvPerfil')} className="bg-white rounded-[14px] border border-border p-5 cursor-pointer hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center text-white font-bold text-[13px]">{ini}</div>
                  <div className="text-[14px] font-bold">{name}</div>
                </div>
                <Badge variant={cls.replace('b-','')}>{sem}</Badge>
              </div>
              <div className="text-[12px] text-text-4 mb-3">{sec} · {emp}</div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-semibold text-text-4">Score {score}/100</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{width:`${score}%`, background: parseInt(score)<50?'#E53935':parseInt(score)<70?'#FFB300':'#C62828'}} />
              </div>
              <Button variant="ghost" size="sm" full className="mt-3">Ver perfil →</Button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
