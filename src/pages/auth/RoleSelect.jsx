import { useApp } from '../../state/AppContext';
import Topbar from '../../components/layout/Topbar';
import Button from '../../components/ui/Button';
import { Briefcase, Building2, Truck } from 'lucide-react';

const roles = [
  {
    id: 'epHome',
    Icon: Briefcase,
    gradient: 'from-[#EF7A2C] to-[#FF9800]',
    badge: 'Empresa financiada',
    title: 'Empresa PYME',
    subtitle: 'Pequeña y Mediana Empresa',
    description:
      'Accede a financiamiento, gestiona tus contratos de crédito y distribuye fondos dentro de la red Bonafide Microbank.',

    buttonLabel: 'Acceder como PYME',
    buttonVariant: 'primary',
  },
  {
    id: 'empDash',
    Icon: Building2,
    gradient: 'from-[#ef7a2c] to-[#FF9800]',
    badge: 'Empresa ancla',
    title: 'Empresa Contratante',
    subtitle: 'Empresa Contratante',
    description:
      'Gestiona tus contratos, emite contratos y administra la distribución de fondos entre las empresas de tu cadena.',

    buttonLabel: 'Acceder como Contratante',
    buttonVariant: 'primary',
  },
  {
    id: 'provDash',
    Icon: Truck,
    gradient: 'from-[#ef7a2c] to-[#FF9800]',
    badge: 'Proveedor de la cadena',
    title: 'Proveedor',
    subtitle: 'Proveedor de Bienes y Servicios',
    description:
      'Gestiona los contratos que te asignan tus PYMEs y distribuye fondos entre tus propios suministradores.',

    buttonLabel: 'Acceder como Proveedor',
    buttonVariant: 'primary',
  },
];

export default function RoleSelect() {
  const { go } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* Mismo Topbar que el resto de la app — sin rol asignado aún, así que
          no muestra el sidebar (RoleSelect es previo a elegir uno). */}
      <Topbar onMenuClick={() => {}} />

      {/* Contenido */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-8">
        <div className="max-w-[1280px] w-full">

          {/* Encabezado */}
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-4xl font-bold text-text-1 mb-3">
              ¿Cuál es tu rol en la plataforma?
            </h1>
            <p className="text-sm sm:text-lg text-text-3">
              Selecciona el perfil con el que quieres continuar
            </p>
          </div>

          {/* Grid de cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map(({ id, Icon, gradient, title, subtitle, description, buttonLabel, buttonVariant }) => (
              <div
                key={id}
                onClick={() => go(id)}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-orange transition-all duration-200 cursor-pointer p-5 sm:p-8 flex flex-col items-center"
              >
        

                {/* Icono */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Títulos */}
                <h2 className="text-2xl font-bold text-text-1 mb-1">{title}</h2>
                <p className="text-sm text-text-4 mb-4">{subtitle}</p>

                {/* Descripción */}
                <p className="text-sm text-center text-text-3 leading-relaxed mb-5">{description}</p>

                <hr className="border-border mb-5" />


                {/* CTA */}
                <Button
                  variant={buttonVariant}
                  full
                  className="h-[48px]"
                  onClick={(e) => { e.stopPropagation(); go(id); }}
                >
                  {buttonLabel} →
                </Button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
