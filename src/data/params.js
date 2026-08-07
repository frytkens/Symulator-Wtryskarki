export const PARAMS = [
  { id: 'T1',  label: 'T1 – dysza',              x: 8.9,  y: 12.0, min: 0,   max: 350,  step: 5,    unit: '°C',  def: 220, active: true, weight: 0.15 },
  { id: 'T2',  label: 'T2',                       x: 19.1, y: 8.0,  min: 0,   max: 350,  step: 5,    unit: '°C',  def: 230 },
  { id: 'T3',  label: 'T3',                       x: 31.1, y: 9.5,  min: 0,   max: 350,  step: 5,    unit: '°C',  def: 235 },
  { id: 'T4',  label: 'T4',                       x: 43.1, y: 8.0,  min: 0,   max: 350,  step: 5,    unit: '°C',  def: 240 },
  { id: 'T5',  label: 'T5',                       x: 55.0, y: 9.5,  min: 0,   max: 350,  step: 5,    unit: '°C',  def: 245 },
  { id: 'TR',  label: 'TR – trawersa',            x: 71.4, y: 8.5,  min: 0,   max: 130,  step: 2,    unit: '°C',  def: 60  },

  { id: 'Td',  label: 'Td – czas docisku',        x: 8.4,  y: 85.0, min: 0,   max: 30,   step: 0.5,  unit: 's',   def: 5   },
  { id: 'Pd',  label: 'Pd – ciśn. docisku',       x: 15.1, y: 85.0, min: 0,   max: 220,  step: 5,    unit: 'bar', def: 40  },
  { id: 'Pp',  label: 'Pp – pkt przełączenia',    x: 26.8, y: 70.0, min: 0,   max: 25,   step: 0.5,  unit: 'mm',  def: 10  },

  { id: 'Pw5', label: 'Pw5',                       x: 33.7, y: 85.0, min: 0,   max: 200,  step: 2,    unit: 'm/s', def: 80  },
  { id: 'Pw4', label: 'Pw4',                       x: 40.5, y: 85.0, min: 0,   max: 200,  step: 2,    unit: 'm/s', def: 80  },
  { id: 'Pw3', label: 'Pw3',                       x: 47.4, y: 85.0, min: 0,   max: 200,  step: 2,    unit: 'm/s', def: 80  },
  { id: 'Pw2', label: 'Pw2',                       x: 54.2, y: 85.0, min: 0,   max: 200,  step: 2,    unit: 'm/s', def: 80  },
  { id: 'Pw1', label: 'Pw1',                       x: 61.0, y: 85.0, min: 0,   max: 200,  step: 2,    unit: 'm/s', def: 80, active: true, weight: 0.25 },
  { id: 'GR',  label: 'GR – gr. ciśn. docisku',   x: 70.9, y: 85.0, min: 0,   max: 220,  step: 5,    unit: 'bar', def: 120 },

  { id: 'Deko', label: 'Deko – dekompresja',      x: 92.5, y: 85.0, min: 0,   max: 100,  step: 1,    unit: 'mm',  def: 7,  active: true, weight: 0.60 },
  { id: 'Prz',  label: 'Prz – przeciwciśn.',      x: 82.5, y: 18.0, min: 0,   max: 40,   step: 1,    unit: 'bar', def: 15  },
  { id: 'Ob',   label: 'Ob – obroty',             x: 92.4, y: 18.0, min: 0,   max: 1.2,  step: 0.05, unit: 'm/s', def: 0.6 },
  { id: 'doz',  label: 'doz – skok dozowania',    x: 85.4, y: 85.0, min: 0,   max: 150,  step: 2,    unit: 'mm',  def: 60  }
]

export const CLAMP_PARAMS = [
  { id: 'Tr', label: 'Tr – temp. strony ruchomej', x: 44.8, y: 11.4, min: 10, max: 100, step: 1, unit: '°C', def: 20 },
  { id: 'Ts', label: 'Ts – temp. strony stałej',   x: 65.5, y: 11.4, min: 10, max: 100, step: 1, unit: '°C', def: 20 },
  { id: 'Tc', label: 'Tc – czas cyklu',            x: 44.8, y: 90.0, min: 0,  max: 120, step: 1, unit: 's',  def: 30 },
  { id: 'Fz', label: 'Fz – siła zwarcia',          x: 66.7, y: 90.0, min: 0,  max: 200, step: 5, unit: 't',  def: 180 }
]

export const CURVES = {
  T1:   [[0,10],[100,30],[150,60],[180,85],[200,95],[220,100],[230,90],[240,80],[250,60],[260,35],[270,15],[300,5],[350,0]],
  Pw1:  [[0,10],[40,20],[80,40],[120,60],[160,85],[200,100]],
  Deko: [[0,20],[5,35],[7,47],[10,75],[15,100],[20,95],[25,55],[30,20],[50,10],[100,5]]
}

export function curveVal(x, pts) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[i + 1]
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0)
      return y0 + t * (y1 - y0)
    }
  }
  return pts[pts.length - 1][1]
}

export const SUCCESS_THRESHOLD = 12 // % ryzyka niedolania, poniżej którego uznajemy sztukę za dobrą

export const TRAINER_NOTES = {
  niedolanie: [
    'Sprawdź rodzaj zaworu zwrotnego',
    'Sprawdź płynność materiału',
    'Sprawdź sprawność zaworu zwrotnego – czy nie jest zepsuty',
    'Sprawdź szczelność dyszy',
    'Sprawdź czy nie jest rozszczelniony GK'
  ]
}
