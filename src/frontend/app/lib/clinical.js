export const today = () => new Intl.DateTimeFormat("en-CA", {year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
export const EMPTY_FOLLOWUP = {baselineOd:"",followupOd:"",baselineOs:"",followupOs:"",baselineOdSphere:"",currentOdSphere:"",baselineOsSphere:"",currentOsSphere:"",interval:6,baselineComfort:"",currentComfort:"",stress:"",wear:"",compliance:"Unknown",baselineDate:"",followupDate:"",baselineCsf:"",currentCsf:"",adverseEvent:"",intolerance:""};
export function blankProfile(example) { return Object.fromEntries(Object.entries(example).map(([k,v])=>[k, typeof v === "number" ? "" : v])); }
export function baselineFrom(profile, date) { return {...EMPTY_FOLLOWUP, baselineOd:profile.odAl, baselineOs:profile.osAl, baselineOdSphere:profile.odSphere, baselineOsSphere:profile.osSphere,baselineDate:date}; }
// Invented six-month follow-up for explicitly synthetic demo patients only.
export function demoFollowupFrom(profile, baselineDate) {
  const baseline = baselineFrom(profile, baselineDate);
  const start = new Date(`${baselineDate}T00:00:00Z`);
  if (!Number.isFinite(start.getTime())) return baseline;
  const next = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth()+7, 0));
  next.setUTCDate(Math.min(start.getUTCDate(), next.getUTCDate()));
  return {...baseline, followupDate:next.toISOString().slice(0,10),
    followupOd:Number((Number(profile.odAl)+0.08).toFixed(2)),
    followupOs:Number((Number(profile.osAl)+0.06).toFixed(2)),
    currentOdSphere:Number(profile.odSphere)-0.25,
    currentOsSphere:Number(profile.osSphere)-0.25,
    baselineComfort:6,currentComfort:8,stress:3,wear:10,compliance:"Good"};
}
export function clinicalError(error) { return error instanceof TypeError ? "Connection interrupted. Your entries are still here. Check the connection and try again." : error.message; }
export async function checkedJson(response) {
  let data;
  try { data = await response.json(); } catch { throw new Error(response.status >= 500 ? "The assessment service could not complete this request. Your entries are preserved. Please try again or contact your administrator." : "The service returned an unreadable response. Please try again."); }
  if (!response.ok) { const d=data.detail; throw new Error(Array.isArray(d) ? d.map(x=>`${x.loc.slice(1).join(" · ")}: ${x.msg}`).join("; ") : d?.message || (typeof d === "string" ? d : `Request could not be completed (${response.status}). Please review your entries and try again.`)); }
  return data;
}
