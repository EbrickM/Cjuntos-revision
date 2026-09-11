import { loadConfig } from '../config';

async function post(path, body) {
  const { identityUrl } = await loadConfig();
  const opts = { method: 'POST' };
  if (body) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${identityUrl}/${path}`, opts);
  return res.json();
}

export const adminService = {
  aprobarKyc:    (id)               => post(`admins/clientes/${id}/aprobar`),
  reevaluarKyc:  (id, observaciones) => post(`admins/clientes/${id}/reevaluar`, { observaciones }),
  desestimarKyc: (id)               => post(`admins/clientes/${id}/desestimar`),
};
