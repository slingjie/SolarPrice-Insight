import { TariffData } from './types';

export const DEFAULT_TARIFFS: TariffData[] = [
  {
    "id": "sh-2026-08-dy-lt1k",
    "province": "上海",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "peak": 0.941813,
      "flat": 0.798213,
      "valley": 0.475113,
      "purchase_agent": 0.428899,
      "line_loss": 0.013266,
      "system_cost": 0.037833,
      "transmission_distribution": 0.2891,
      "government_funds": 0.029115
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "peak"
      },
      {
        "start": "14:00",
        "end": "15:00",
        "type": "peak"
      },
      {
        "start": "15:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网上海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "沪发改价管﹝2022﹞50号",
    "float_rules": {
      "tip": 2.25,
      "base_type": "agency_only",
      "formula_note": "两部制夏冬季高峰上浮80%，低谷下浮60%，尖峰在高峰基础上上浮25%",
      "special_period_note": "7、8月尖峰时段 12:00-14:00"
    },
    "_deleted": false
  },
  {
    "id": "sh-2026-08-dy-1_10k",
    "province": "上海",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.888413,
      "flat": 0.753713,
      "valley": 0.450638,
      "purchase_agent": 0.428899,
      "line_loss": 0.013266,
      "system_cost": 0.037833,
      "transmission_distribution": 0.2446,
      "government_funds": 0.029115
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "peak"
      },
      {
        "start": "14:00",
        "end": "15:00",
        "type": "peak"
      },
      {
        "start": "15:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网上海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "沪发改价管﹝2022﹞50号",
    "float_rules": {
      "tip": 2.25,
      "base_type": "agency_only",
      "formula_note": "两部制夏冬季高峰上浮80%，低谷下浮60%，尖峰在高峰基础上上浮25%",
      "special_period_note": "7、8月尖峰时段 12:00-14:00"
    },
    "_deleted": false
  },
  {
    "id": "sh-2026-08-dy-35k",
    "province": "上海",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.833573,
      "flat": 0.708013,
      "valley": 0.425503,
      "purchase_agent": 0.428899,
      "line_loss": 0.013266,
      "system_cost": 0.037833,
      "transmission_distribution": 0.1989,
      "government_funds": 0.029115
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "peak"
      },
      {
        "start": "14:00",
        "end": "15:00",
        "type": "peak"
      },
      {
        "start": "15:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网上海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "沪发改价管﹝2022﹞50号",
    "float_rules": {
      "tip": 2.25,
      "base_type": "agency_only",
      "formula_note": "两部制夏冬季高峰上浮80%，低谷下浮60%，尖峰在高峰基础上上浮25%",
      "special_period_note": "7、8月尖峰时段 12:00-14:00"
    },
    "_deleted": false
  },
  {
    "id": "sh-2026-08-dy-110k",
    "province": "上海",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.793613,
      "flat": 0.674713,
      "valley": 0.407188,
      "purchase_agent": 0.428899,
      "line_loss": 0.013266,
      "system_cost": 0.037833,
      "transmission_distribution": 0.1656,
      "government_funds": 0.029115
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "peak"
      },
      {
        "start": "14:00",
        "end": "15:00",
        "type": "peak"
      },
      {
        "start": "15:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网上海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "沪发改价管﹝2022﹞50号",
    "float_rules": {
      "tip": 2.25,
      "base_type": "agency_only",
      "formula_note": "两部制夏冬季高峰上浮80%，低谷下浮60%，尖峰在高峰基础上上浮25%",
      "special_period_note": "7、8月尖峰时段 12:00-14:00"
    },
    "_deleted": false
  },
  {
    "id": "sh-2026-08-dy-220up",
    "province": "上海",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.724013,
      "flat": 0.616713,
      "valley": 0.375288,
      "purchase_agent": 0.428899,
      "line_loss": 0.013266,
      "system_cost": 0.037833,
      "transmission_distribution": 0.1076,
      "government_funds": 0.029115
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "peak"
      },
      {
        "start": "14:00",
        "end": "15:00",
        "type": "peak"
      },
      {
        "start": "15:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网上海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "沪发改价管﹝2022﹞50号",
    "float_rules": {
      "tip": 2.25,
      "base_type": "agency_only",
      "formula_note": "两部制夏冬季高峰上浮80%，低谷下浮60%，尖峰在高峰基础上上浮25%",
      "special_period_note": "7、8月尖峰时段 12:00-14:00"
    },
    "_deleted": false
  },
  {
    "id": "sh-2026-08-dl-lt1k",
    "province": "上海",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "不满1kV",
    "prices": {
      "tip": 1.445962,
      "peak": 1.172812,
      "flat": 0.687213,
      "valley": 0.323014,
      "purchase_agent": 0.428899,
      "line_loss": 0.013266,
      "system_cost": 0.037833,
      "transmission_distribution": 0.1781,
      "government_funds": 0.029115,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "tip"
      },
      {
        "start": "14:00",
        "end": "15:00",
        "type": "peak"
      },
      {
        "start": "15:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网上海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "沪发改价管﹝2022﹞50号",
    "float_rules": {
      "tip": 2.25,
      "base_type": "agency_only",
      "formula_note": "两部制夏冬季高峰上浮80%，低谷下浮60%，尖峰在高峰基础上上浮25%",
      "special_period_note": "7、8月尖峰时段 12:00-14:00"
    },
    "_deleted": false
  },
  {
    "id": "sh-2026-08-dl-1_10k",
    "province": "上海",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.410412,
      "peak": 1.144372,
      "flat": 0.671413,
      "valley": 0.316694,
      "purchase_agent": 0.428899,
      "line_loss": 0.013266,
      "system_cost": 0.037833,
      "transmission_distribution": 0.1623,
      "government_funds": 0.029115,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "tip"
      },
      {
        "start": "14:00",
        "end": "15:00",
        "type": "peak"
      },
      {
        "start": "15:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网上海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "沪发改价管﹝2022﹞50号",
    "float_rules": {
      "tip": 2.25,
      "base_type": "agency_only",
      "formula_note": "两部制夏冬季高峰上浮80%，低谷下浮60%，尖峰在高峰基础上上浮25%",
      "special_period_note": "7、8月尖峰时段 12:00-14:00"
    },
    "_deleted": false
  },
  {
    "id": "sh-2026-08-dl-35k",
    "province": "上海",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 1.330537,
      "peak": 1.080472,
      "flat": 0.635913,
      "valley": 0.302494,
      "purchase_agent": 0.428899,
      "line_loss": 0.013266,
      "system_cost": 0.037833,
      "transmission_distribution": 0.1268,
      "government_funds": 0.029115,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "tip"
      },
      {
        "start": "14:00",
        "end": "15:00",
        "type": "peak"
      },
      {
        "start": "15:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网上海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "沪发改价管﹝2022﹞50号",
    "float_rules": {
      "tip": 2.25,
      "base_type": "agency_only",
      "formula_note": "两部制夏冬季高峰上浮80%，低谷下浮60%，尖峰在高峰基础上上浮25%",
      "special_period_note": "7、8月尖峰时段 12:00-14:00"
    },
    "_deleted": false
  },
  {
    "id": "sh-2026-08-dl-110k",
    "province": "上海",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 1.259662,
      "peak": 1.023772,
      "flat": 0.604413,
      "valley": 0.289894,
      "purchase_agent": 0.428899,
      "line_loss": 0.013266,
      "system_cost": 0.037833,
      "transmission_distribution": 0.0953,
      "government_funds": 0.029115,
      "demand_charge": 38.4,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "tip"
      },
      {
        "start": "14:00",
        "end": "15:00",
        "type": "peak"
      },
      {
        "start": "15:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网上海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "沪发改价管﹝2022﹞50号",
    "float_rules": {
      "tip": 2.25,
      "base_type": "agency_only",
      "formula_note": "两部制夏冬季高峰上浮80%，低谷下浮60%，尖峰在高峰基础上上浮25%",
      "special_period_note": "7、8月尖峰时段 12:00-14:00"
    },
    "_deleted": false
  },
  {
    "id": "sh-2026-08-dl-220up",
    "province": "上海",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 1.236712,
      "peak": 1.005412,
      "flat": 0.594213,
      "valley": 0.285814,
      "purchase_agent": 0.428899,
      "line_loss": 0.013266,
      "system_cost": 0.037833,
      "transmission_distribution": 0.0851,
      "government_funds": 0.029115,
      "demand_charge": 35.2,
      "capacity_charge": 22.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "tip"
      },
      {
        "start": "14:00",
        "end": "15:00",
        "type": "peak"
      },
      {
        "start": "15:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网上海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "沪发改价管﹝2022﹞50号",
    "float_rules": {
      "tip": 2.25,
      "base_type": "agency_only",
      "formula_note": "两部制夏冬季高峰上浮80%，低谷下浮60%，尖峰在高峰基础上上浮25%",
      "special_period_note": "7、8月尖峰时段 12:00-14:00"
    },
    "_deleted": false
  },
  {
    "id": "jb-2026-08-dy-lt1k",
    "province": "冀北",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "tip": 1.02948967,
      "peak": 0.89396635,
      "flat": 0.61494775,
      "valley": 0.33592915,
      "deep": 0.31201327,
      "purchase_agent": 0.385713,
      "line_loss": 0.011778,
      "system_cost": 0.013088,
      "transmission_distribution": 0.1803,
      "government_funds": 0.02406875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "19:00",
        "type": "tip"
      },
      {
        "start": "19:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网冀北95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "冀发改能价〔2025〕1275号",
    "float_rules": {
      "tip": 2.04,
      "peak": 1.7,
      "valley": 0.3,
      "deep": 0.24,
      "base_type": "agency_only",
      "formula_note": "高峰低谷上下浮70%，尖峰在高峰上浮20%，深谷在低谷下浮20%；线损输配系统费不浮动",
      "special_period_note": "6-8月尖峰 17:00-19:00"
    },
    "_deleted": false
  },
  {
    "id": "jb-2026-08-dy-1_10k",
    "province": "冀北",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.00748967,
      "peak": 0.87196635,
      "flat": 0.59294775,
      "valley": 0.31392915,
      "deep": 0.29001327,
      "purchase_agent": 0.385713,
      "line_loss": 0.011778,
      "system_cost": 0.013088,
      "transmission_distribution": 0.1583,
      "government_funds": 0.02406875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "19:00",
        "type": "tip"
      },
      {
        "start": "19:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网冀北95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "冀发改能价〔2025〕1275号",
    "float_rules": {
      "tip": 2.04,
      "peak": 1.7,
      "valley": 0.3,
      "deep": 0.24,
      "base_type": "agency_only",
      "formula_note": "高峰低谷上下浮70%，尖峰在高峰上浮20%，深谷在低谷下浮20%；线损输配系统费不浮动",
      "special_period_note": "6-8月尖峰 17:00-19:00"
    },
    "_deleted": false
  },
  {
    "id": "jb-2026-08-dy-35k",
    "province": "冀北",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 0.98548967,
      "peak": 0.84996635,
      "flat": 0.57094775,
      "valley": 0.29192915,
      "deep": 0.26801327,
      "purchase_agent": 0.385713,
      "line_loss": 0.011778,
      "system_cost": 0.013088,
      "transmission_distribution": 0.1363,
      "government_funds": 0.02406875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "19:00",
        "type": "tip"
      },
      {
        "start": "19:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网冀北95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "冀发改能价〔2025〕1275号",
    "float_rules": {
      "tip": 2.04,
      "peak": 1.7,
      "valley": 0.3,
      "deep": 0.24,
      "base_type": "agency_only",
      "formula_note": "高峰低谷上下浮70%，尖峰在高峰上浮20%，深谷在低谷下浮20%；线损输配系统费不浮动",
      "special_period_note": "6-8月尖峰 17:00-19:00"
    },
    "_deleted": false
  },
  {
    "id": "jb-2026-08-dy-110k",
    "province": "冀北",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 0.96348967,
      "peak": 0.82796635,
      "flat": 0.54894775,
      "valley": 0.26992915,
      "deep": 0.24601327,
      "purchase_agent": 0.385713,
      "line_loss": 0.011778,
      "system_cost": 0.013088,
      "transmission_distribution": 0.1143,
      "government_funds": 0.02406875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "19:00",
        "type": "tip"
      },
      {
        "start": "19:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网冀北95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "冀发改能价〔2025〕1275号",
    "float_rules": {
      "tip": 2.04,
      "peak": 1.7,
      "valley": 0.3,
      "deep": 0.24,
      "base_type": "agency_only",
      "formula_note": "高峰低谷上下浮70%，尖峰在高峰上浮20%，深谷在低谷下浮20%；线损输配系统费不浮动",
      "special_period_note": "6-8月尖峰 17:00-19:00"
    },
    "_deleted": false
  },
  {
    "id": "jb-2026-08-dy-220up",
    "province": "冀北",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 0.95148967,
      "peak": 0.81596635,
      "flat": 0.53694775,
      "valley": 0.25792915,
      "deep": 0.23401327,
      "purchase_agent": 0.385713,
      "line_loss": 0.011778,
      "system_cost": 0.013088,
      "transmission_distribution": 0.1023,
      "government_funds": 0.02406875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "19:00",
        "type": "tip"
      },
      {
        "start": "19:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网冀北95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "冀发改能价〔2025〕1275号",
    "float_rules": {
      "tip": 2.04,
      "peak": 1.7,
      "valley": 0.3,
      "deep": 0.24,
      "base_type": "agency_only",
      "formula_note": "高峰低谷上下浮70%，尖峰在高峰上浮20%，深谷在低谷下浮20%；线损输配系统费不浮动",
      "special_period_note": "6-8月尖峰 17:00-19:00"
    },
    "_deleted": false
  },
  {
    "id": "jb-2026-08-dl-lt1k",
    "province": "冀北",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "不满1kV",
    "prices": {
      "tip": 1.00768967,
      "peak": 0.87216635,
      "flat": 0.59314775,
      "valley": 0.31412915,
      "deep": 0.29021327,
      "purchase_agent": 0.385713,
      "line_loss": 0.011778,
      "system_cost": 0.013088,
      "transmission_distribution": 0.1585,
      "government_funds": 0.02406875,
      "demand_charge": 39.4,
      "capacity_charge": 24.6
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "19:00",
        "type": "tip"
      },
      {
        "start": "19:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网冀北95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "冀发改能价〔2025〕1275号",
    "float_rules": {
      "tip": 2.04,
      "peak": 1.7,
      "valley": 0.3,
      "deep": 0.24,
      "base_type": "agency_only",
      "formula_note": "高峰低谷上下浮70%，尖峰在高峰上浮20%，深谷在低谷下浮20%；线损输配系统费不浮动",
      "special_period_note": "6-8月尖峰 17:00-19:00"
    },
    "_deleted": false
  },
  {
    "id": "jb-2026-08-dl-1_10k",
    "province": "冀北",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 0.98568967,
      "peak": 0.85016635,
      "flat": 0.57114775,
      "valley": 0.29212915,
      "deep": 0.26821327,
      "purchase_agent": 0.385713,
      "line_loss": 0.011778,
      "system_cost": 0.013088,
      "transmission_distribution": 0.1365,
      "government_funds": 0.02406875,
      "demand_charge": 37.8,
      "capacity_charge": 23.6
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "19:00",
        "type": "tip"
      },
      {
        "start": "19:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网冀北95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "冀发改能价〔2025〕1275号",
    "float_rules": {
      "tip": 2.04,
      "peak": 1.7,
      "valley": 0.3,
      "deep": 0.24,
      "base_type": "agency_only",
      "formula_note": "高峰低谷上下浮70%，尖峰在高峰上浮20%，深谷在低谷下浮20%；线损输配系统费不浮动",
      "special_period_note": "6-8月尖峰 17:00-19:00"
    },
    "_deleted": false
  },
  {
    "id": "jb-2026-08-dl-35k",
    "province": "冀北",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 0.96368967,
      "peak": 0.82816635,
      "flat": 0.54914775,
      "valley": 0.27012915,
      "deep": 0.24621327,
      "purchase_agent": 0.385713,
      "line_loss": 0.011778,
      "system_cost": 0.013088,
      "transmission_distribution": 0.1145,
      "government_funds": 0.02406875,
      "demand_charge": 36.2,
      "capacity_charge": 22.6
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "19:00",
        "type": "tip"
      },
      {
        "start": "19:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网冀北95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "冀发改能价〔2025〕1275号",
    "float_rules": {
      "tip": 2.04,
      "peak": 1.7,
      "valley": 0.3,
      "deep": 0.24,
      "base_type": "agency_only",
      "formula_note": "高峰低谷上下浮70%，尖峰在高峰上浮20%，深谷在低谷下浮20%；线损输配系统费不浮动",
      "special_period_note": "6-8月尖峰 17:00-19:00"
    },
    "_deleted": false
  },
  {
    "id": "jb-2026-08-dl-110k",
    "province": "冀北",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 0.94168967,
      "peak": 0.80616635,
      "flat": 0.52714775,
      "valley": 0.24812915,
      "deep": 0.22421327,
      "purchase_agent": 0.385713,
      "line_loss": 0.011778,
      "system_cost": 0.013088,
      "transmission_distribution": 0.0925,
      "government_funds": 0.02406875,
      "demand_charge": 34.6,
      "capacity_charge": 21.6
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "19:00",
        "type": "tip"
      },
      {
        "start": "19:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网冀北95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "冀发改能价〔2025〕1275号",
    "float_rules": {
      "tip": 2.04,
      "peak": 1.7,
      "valley": 0.3,
      "deep": 0.24,
      "base_type": "agency_only",
      "formula_note": "高峰低谷上下浮70%，尖峰在高峰上浮20%，深谷在低谷下浮20%；线损输配系统费不浮动",
      "special_period_note": "6-8月尖峰 17:00-19:00"
    },
    "_deleted": false
  },
  {
    "id": "jb-2026-08-dl-220up",
    "province": "冀北",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 0.91968967,
      "peak": 0.78416635,
      "flat": 0.50514775,
      "valley": 0.22612915,
      "deep": 0.20221327,
      "purchase_agent": 0.385713,
      "line_loss": 0.011778,
      "system_cost": 0.013088,
      "transmission_distribution": 0.0705,
      "government_funds": 0.02406875,
      "demand_charge": 33.0,
      "capacity_charge": 20.6
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "12:00",
        "type": "peak"
      },
      {
        "start": "12:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "19:00",
        "type": "tip"
      },
      {
        "start": "19:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网冀北95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "冀发改能价〔2025〕1275号",
    "float_rules": {
      "tip": 2.04,
      "peak": 1.7,
      "valley": 0.3,
      "deep": 0.24,
      "base_type": "agency_only",
      "formula_note": "高峰低谷上下浮70%，尖峰在高峰上浮20%，深谷在低谷下浮20%；线损输配系统费不浮动",
      "special_period_note": "6-8月尖峰 17:00-19:00"
    },
    "_deleted": false
  },
  {
    "id": "bj-2026-08-dy-lt1k",
    "province": "北京",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "tip": 1.07365375,
      "peak": 1.07365375,
      "flat": 0.79696575,
      "valley": 0.54755675,
      "purchase_agent": 0.389702,
      "line_loss": 0.012228,
      "transmission_distribution": 0.38,
      "government_funds": 0.02716875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "tip"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网北京95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "京发改规〔2023〕11号",
    "float_rules": {
      "tip": "高峰基础上上浮20%",
      "base_type": "agency_plus_transmission",
      "formula_note": "在代理购电价格基础上根据京发改规〔2023〕11号比价形成",
      "special_period_note": "夏季7、8月尖峰 11:00-13:00、16:00-17:00"
    },
    "_deleted": false
  },
  {
    "id": "bj-2026-08-dy-1_10k",
    "province": "北京",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.17902075,
      "peak": 1.03872775,
      "flat": 0.72696575,
      "valley": 0.45417475,
      "purchase_agent": 0.389702,
      "line_loss": 0.012228,
      "transmission_distribution": 0.31,
      "government_funds": 0.02716875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "tip"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网北京95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "京发改规〔2023〕11号",
    "float_rules": {
      "tip": "高峰基础上上浮20%",
      "base_type": "agency_plus_transmission",
      "formula_note": "在代理购电价格基础上根据京发改规〔2023〕11号比价形成",
      "special_period_note": "夏季7、8月尖峰 11:00-13:00、16:00-17:00"
    },
    "_deleted": false
  },
  {
    "id": "bj-2026-08-dy-35_110k",
    "province": "北京",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "35-110kV",
    "prices": {
      "tip": 1.11902075,
      "peak": 0.97872775,
      "flat": 0.66696575,
      "valley": 0.39417475,
      "purchase_agent": 0.389702,
      "line_loss": 0.012228,
      "transmission_distribution": 0.25,
      "government_funds": 0.02716875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "tip"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网北京95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "京发改规〔2023〕11号",
    "float_rules": {
      "tip": "高峰基础上上浮20%",
      "base_type": "agency_plus_transmission",
      "formula_note": "在代理购电价格基础上根据京发改规〔2023〕11号比价形成",
      "special_period_note": "夏季7、8月尖峰 11:00-13:00、16:00-17:00"
    },
    "_deleted": false
  },
  {
    "id": "bj-2026-08-dy-220up",
    "province": "北京",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 1.06902075,
      "peak": 0.92872775,
      "flat": 0.61696575,
      "valley": 0.34417475,
      "purchase_agent": 0.389702,
      "line_loss": 0.012228,
      "transmission_distribution": 0.2,
      "government_funds": 0.02716875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "tip"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网北京95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "京发改规〔2023〕11号",
    "float_rules": {
      "tip": "高峰基础上上浮20%",
      "base_type": "agency_plus_transmission",
      "formula_note": "在代理购电价格基础上根据京发改规〔2023〕11号比价形成",
      "special_period_note": "夏季7、8月尖峰 11:00-13:00、16:00-17:00"
    },
    "_deleted": false
  },
  {
    "id": "bj-2026-08-dl-1_10k",
    "province": "北京",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 0.98049175,
      "peak": 0.85578675,
      "flat": 0.62196575,
      "valley": 0.38814475,
      "purchase_agent": 0.389702,
      "line_loss": 0.012228,
      "transmission_distribution": 0.205,
      "government_funds": 0.02716875,
      "demand_charge": 52.0,
      "capacity_charge": 33.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "tip"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网北京95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "京发改规〔2023〕11号",
    "float_rules": {
      "tip": "高峰基础上上浮20%",
      "base_type": "agency_plus_transmission",
      "formula_note": "在代理购电价格基础上根据京发改规〔2023〕11号比价形成",
      "special_period_note": "夏季7、8月尖峰 11:00-13:00、16:00-17:00"
    },
    "_deleted": false
  },
  {
    "id": "bj-2026-08-dl-35_110k",
    "province": "北京",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "35-110kV",
    "prices": {
      "tip": 0.94049175,
      "peak": 0.81578675,
      "flat": 0.58196575,
      "valley": 0.34814475,
      "purchase_agent": 0.389702,
      "line_loss": 0.012228,
      "transmission_distribution": 0.165,
      "government_funds": 0.02716875,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "tip"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网北京95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "京发改规〔2023〕11号",
    "float_rules": {
      "tip": "高峰基础上上浮20%",
      "base_type": "agency_plus_transmission",
      "formula_note": "在代理购电价格基础上根据京发改规〔2023〕11号比价形成",
      "special_period_note": "夏季7、8月尖峰 11:00-13:00、16:00-17:00"
    },
    "_deleted": false
  },
  {
    "id": "bj-2026-08-dl-220up",
    "province": "北京",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 0.92549175,
      "peak": 0.80078675,
      "flat": 0.56696575,
      "valley": 0.33314475,
      "purchase_agent": 0.389702,
      "line_loss": 0.012228,
      "transmission_distribution": 0.15,
      "government_funds": 0.02716875,
      "demand_charge": 45.0,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "tip"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网北京95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "京发改规〔2023〕11号",
    "float_rules": {
      "tip": "高峰基础上上浮20%",
      "base_type": "agency_plus_transmission",
      "formula_note": "在代理购电价格基础上根据京发改规〔2023〕11号比价形成",
      "special_period_note": "夏季7、8月尖峰 11:00-13:00、16:00-17:00"
    },
    "_deleted": false
  },
  {
    "id": "jl-2026-08-dy-lt1k",
    "province": "吉林",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "peak": 1.0260353,
      "flat": 0.835028,
      "valley": 0.6440207,
      "purchase_agent": 0.347286,
      "line_loss": 0.020739,
      "system_cost": 0.134978,
      "transmission_distribution": 0.287,
      "government_funds": 0.045025
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "10:00",
        "type": "peak"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网吉林95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "吉发改价格〔2023〕",
    "float_rules": {
      "peak": 1.55,
      "flat": 1.0,
      "valley": 0.45,
      "base_type": "agency_only",
      "formula_note": "平时段基础上分别上下浮动55%，输配系统费基金线损不浮动",
      "special_period_note": "尖峰电价为供需紧张时适时启动的灵活机制"
    },
    "_deleted": false
  },
  {
    "id": "jl-2026-08-dy-1_10k",
    "province": "吉林",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.9960353,
      "flat": 0.805028,
      "valley": 0.6140207,
      "purchase_agent": 0.347286,
      "line_loss": 0.020739,
      "system_cost": 0.134978,
      "transmission_distribution": 0.257,
      "government_funds": 0.045025
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "10:00",
        "type": "peak"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网吉林95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "吉发改价格〔2023〕",
    "float_rules": {
      "peak": 1.55,
      "flat": 1.0,
      "valley": 0.45,
      "base_type": "agency_only",
      "formula_note": "平时段基础上分别上下浮动55%，输配系统费基金线损不浮动",
      "special_period_note": "尖峰电价为供需紧张时适时启动的灵活机制"
    },
    "_deleted": false
  },
  {
    "id": "jl-2026-08-dy-66k",
    "province": "吉林",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "66kV",
    "prices": {
      "peak": 0.9860353,
      "flat": 0.795028,
      "valley": 0.6040207,
      "purchase_agent": 0.347286,
      "line_loss": 0.020739,
      "system_cost": 0.134978,
      "transmission_distribution": 0.247,
      "government_funds": 0.045025
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "10:00",
        "type": "peak"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网吉林95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "吉发改价格〔2023〕",
    "float_rules": {
      "peak": 1.55,
      "flat": 1.0,
      "valley": 0.45,
      "base_type": "agency_only",
      "formula_note": "平时段基础上分别上下浮动55%，输配系统费基金线损不浮动",
      "special_period_note": "尖峰电价为供需紧张时适时启动的灵活机制"
    },
    "_deleted": false
  },
  {
    "id": "jl-2026-08-dy-220up",
    "province": "吉林",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.9660353,
      "flat": 0.775028,
      "valley": 0.5840207,
      "purchase_agent": 0.347286,
      "line_loss": 0.020739,
      "system_cost": 0.134978,
      "transmission_distribution": 0.227,
      "government_funds": 0.045025
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "10:00",
        "type": "peak"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网吉林95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "吉发改价格〔2023〕",
    "float_rules": {
      "peak": 1.55,
      "flat": 1.0,
      "valley": 0.45,
      "base_type": "agency_only",
      "formula_note": "平时段基础上分别上下浮动55%，输配系统费基金线损不浮动",
      "special_period_note": "尖峰电价为供需紧张时适时启动的灵活机制"
    },
    "_deleted": false
  },
  {
    "id": "jl-2026-08-dl-1_10k",
    "province": "吉林",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.8903353,
      "flat": 0.699328,
      "valley": 0.5083207,
      "purchase_agent": 0.347286,
      "line_loss": 0.020739,
      "system_cost": 0.134978,
      "transmission_distribution": 0.1513,
      "government_funds": 0.045025,
      "demand_charge": 38.4,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "10:00",
        "type": "peak"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网吉林95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "吉发改价格〔2023〕",
    "float_rules": {
      "peak": 1.55,
      "flat": 1.0,
      "valley": 0.45,
      "base_type": "agency_only",
      "formula_note": "平时段基础上分别上下浮动55%，输配系统费基金线损不浮动",
      "special_period_note": "尖峰电价为供需紧张时适时启动的灵活机制"
    },
    "_deleted": false
  },
  {
    "id": "jl-2026-08-dl-66k",
    "province": "吉林",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "66kV",
    "prices": {
      "peak": 0.8603353,
      "flat": 0.669328,
      "valley": 0.4783207,
      "purchase_agent": 0.347286,
      "line_loss": 0.020739,
      "system_cost": 0.134978,
      "transmission_distribution": 0.1213,
      "government_funds": 0.045025,
      "demand_charge": 36.8,
      "capacity_charge": 23.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "10:00",
        "type": "peak"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网吉林95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "吉发改价格〔2023〕",
    "float_rules": {
      "peak": 1.55,
      "flat": 1.0,
      "valley": 0.45,
      "base_type": "agency_only",
      "formula_note": "平时段基础上分别上下浮动55%，输配系统费基金线损不浮动",
      "special_period_note": "尖峰电价为供需紧张时适时启动的灵活机制"
    },
    "_deleted": false
  },
  {
    "id": "jl-2026-08-dl-220up",
    "province": "吉林",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.8503353,
      "flat": 0.659328,
      "valley": 0.4683207,
      "purchase_agent": 0.347286,
      "line_loss": 0.020739,
      "system_cost": 0.134978,
      "transmission_distribution": 0.1113,
      "government_funds": 0.045025,
      "demand_charge": 36.8,
      "capacity_charge": 23.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "08:00",
        "type": "flat"
      },
      {
        "start": "08:00",
        "end": "10:00",
        "type": "peak"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "flat"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网吉林95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "吉发改价格〔2023〕",
    "float_rules": {
      "peak": 1.55,
      "flat": 1.0,
      "valley": 0.45,
      "base_type": "agency_only",
      "formula_note": "平时段基础上分别上下浮动55%，输配系统费基金线损不浮动",
      "special_period_note": "尖峰电价为供需紧张时适时启动的灵活机制"
    },
    "_deleted": false
  },
  {
    "id": "sc-2026-08-dy-lt1k",
    "province": "四川",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "peak": 0.943124,
      "flat": 0.623744,
      "valley": 0.304364,
      "purchase_agent": 0.260434,
      "line_loss": 0.015566,
      "system_cost": 0.044275,
      "transmission_distribution": 0.2563,
      "government_funds": 0.04716875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "peak"
      },
      {
        "start": "13:00",
        "end": "14:00",
        "type": "peak"
      },
      {
        "start": "14:00",
        "end": "19:00",
        "type": "flat"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网四川95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "川发改价格〔2023〕330号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_loss_system",
      "formula_note": "高峰上浮60%，低谷下浮60%，7-8月大工业尖峰在高峰基础上上浮20%",
      "special_period_note": "7-8月全月及连续3日气温>=35度时执行尖峰 13:00-14:00、21:00-23:00"
    },
    "_deleted": false
  },
  {
    "id": "sc-2026-08-dy-1_10k",
    "province": "四川",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.900884,
      "flat": 0.597344,
      "valley": 0.293804,
      "purchase_agent": 0.260434,
      "line_loss": 0.015566,
      "system_cost": 0.044275,
      "transmission_distribution": 0.2299,
      "government_funds": 0.04716875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "peak"
      },
      {
        "start": "13:00",
        "end": "14:00",
        "type": "peak"
      },
      {
        "start": "14:00",
        "end": "19:00",
        "type": "flat"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网四川95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "川发改价格〔2023〕330号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_loss_system",
      "formula_note": "高峰上浮60%，低谷下浮60%，7-8月大工业尖峰在高峰基础上上浮20%",
      "special_period_note": "7-8月全月及连续3日气温>=35度时执行尖峰 13:00-14:00、21:00-23:00"
    },
    "_deleted": false
  },
  {
    "id": "sc-2026-08-dy-35k",
    "province": "四川",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.851764,
      "flat": 0.566644,
      "valley": 0.281524,
      "purchase_agent": 0.260434,
      "line_loss": 0.015566,
      "system_cost": 0.044275,
      "transmission_distribution": 0.1992,
      "government_funds": 0.04716875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "peak"
      },
      {
        "start": "13:00",
        "end": "14:00",
        "type": "peak"
      },
      {
        "start": "14:00",
        "end": "19:00",
        "type": "flat"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网四川95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "川发改价格〔2023〕330号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_loss_system",
      "formula_note": "高峰上浮60%，低谷下浮60%，7-8月大工业尖峰在高峰基础上上浮20%",
      "special_period_note": "7-8月全月及连续3日气温>=35度时执行尖峰 13:00-14:00、21:00-23:00"
    },
    "_deleted": false
  },
  {
    "id": "sc-2026-08-dy-110k",
    "province": "四川",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.713204,
      "flat": 0.480044,
      "valley": 0.246884,
      "purchase_agent": 0.260434,
      "line_loss": 0.015566,
      "system_cost": 0.044275,
      "transmission_distribution": 0.1126,
      "government_funds": 0.04716875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "peak"
      },
      {
        "start": "13:00",
        "end": "14:00",
        "type": "peak"
      },
      {
        "start": "14:00",
        "end": "19:00",
        "type": "flat"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网四川95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "川发改价格〔2023〕330号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_loss_system",
      "formula_note": "高峰上浮60%，低谷下浮60%，7-8月大工业尖峰在高峰基础上上浮20%",
      "special_period_note": "7-8月全月及连续3日气温>=35度时执行尖峰 13:00-14:00、21:00-23:00"
    },
    "_deleted": false
  },
  {
    "id": "sc-2026-08-dy-220up",
    "province": "四川",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.682484,
      "flat": 0.460844,
      "valley": 0.239204,
      "purchase_agent": 0.260434,
      "line_loss": 0.015566,
      "system_cost": 0.044275,
      "transmission_distribution": 0.0934,
      "government_funds": 0.04716875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "peak"
      },
      {
        "start": "13:00",
        "end": "14:00",
        "type": "peak"
      },
      {
        "start": "14:00",
        "end": "19:00",
        "type": "flat"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网四川95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "川发改价格〔2023〕330号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_loss_system",
      "formula_note": "高峰上浮60%，低谷下浮60%，7-8月大工业尖峰在高峰基础上上浮20%",
      "special_period_note": "7-8月全月及连续3日气温>=35度时执行尖峰 13:00-14:00、21:00-23:00"
    },
    "_deleted": false
  },
  {
    "id": "sc-2026-08-dl-1_10k",
    "province": "四川",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 0.888436,
      "peak": 0.755604,
      "flat": 0.506544,
      "valley": 0.257484,
      "purchase_agent": 0.260434,
      "line_loss": 0.015566,
      "system_cost": 0.044275,
      "transmission_distribution": 0.1391,
      "government_funds": 0.04716875,
      "demand_charge": 35.0,
      "capacity_charge": 22.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "peak"
      },
      {
        "start": "13:00",
        "end": "14:00",
        "type": "tip"
      },
      {
        "start": "14:00",
        "end": "19:00",
        "type": "flat"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "tip"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网四川95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "川发改价格〔2023〕330号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_loss_system",
      "formula_note": "高峰上浮60%，低谷下浮60%，7-8月大工业尖峰在高峰基础上上浮20%",
      "special_period_note": "7-8月全月及连续3日气温>=35度时执行尖峰 13:00-14:00、21:00-23:00"
    },
    "_deleted": false
  },
  {
    "id": "sc-2026-08-dl-35k",
    "province": "四川",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 0.837364,
      "peak": 0.713044,
      "flat": 0.479944,
      "valley": 0.246844,
      "purchase_agent": 0.260434,
      "line_loss": 0.015566,
      "system_cost": 0.044275,
      "transmission_distribution": 0.1125,
      "government_funds": 0.04716875,
      "demand_charge": 30.0,
      "capacity_charge": 19.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "peak"
      },
      {
        "start": "13:00",
        "end": "14:00",
        "type": "tip"
      },
      {
        "start": "14:00",
        "end": "19:00",
        "type": "flat"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "tip"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网四川95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "川发改价格〔2023〕330号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_loss_system",
      "formula_note": "高峰上浮60%，低谷下浮60%，7-8月大工业尖峰在高峰基础上上浮20%",
      "special_period_note": "7-8月全月及连续3日气温>=35度时执行尖峰 13:00-14:00、21:00-23:00"
    },
    "_deleted": false
  },
  {
    "id": "sc-2026-08-dl-110k",
    "province": "四川",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 0.745012,
      "peak": 0.636084,
      "flat": 0.431844,
      "valley": 0.227604,
      "purchase_agent": 0.260434,
      "line_loss": 0.015566,
      "system_cost": 0.044275,
      "transmission_distribution": 0.0644,
      "government_funds": 0.04716875,
      "demand_charge": 27.0,
      "capacity_charge": 17.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "peak"
      },
      {
        "start": "13:00",
        "end": "14:00",
        "type": "tip"
      },
      {
        "start": "14:00",
        "end": "19:00",
        "type": "flat"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "tip"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网四川95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "川发改价格〔2023〕330号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_loss_system",
      "formula_note": "高峰上浮60%，低谷下浮60%，7-8月大工业尖峰在高峰基础上上浮20%",
      "special_period_note": "7-8月全月及连续3日气温>=35度时执行尖峰 13:00-14:00、21:00-23:00"
    },
    "_deleted": false
  },
  {
    "id": "sc-2026-08-dl-220up",
    "province": "四川",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 0.710836,
      "peak": 0.607604,
      "flat": 0.414044,
      "valley": 0.220484,
      "purchase_agent": 0.260434,
      "line_loss": 0.015566,
      "system_cost": 0.044275,
      "transmission_distribution": 0.0466,
      "government_funds": 0.04716875,
      "demand_charge": 24.0,
      "capacity_charge": 15.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "peak"
      },
      {
        "start": "13:00",
        "end": "14:00",
        "type": "tip"
      },
      {
        "start": "14:00",
        "end": "19:00",
        "type": "flat"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "peak"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "tip"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网四川95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "川发改价格〔2023〕330号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_loss_system",
      "formula_note": "高峰上浮60%，低谷下浮60%，7-8月大工业尖峰在高峰基础上上浮20%",
      "special_period_note": "7-8月全月及连续3日气温>=35度时执行尖峰 13:00-14:00、21:00-23:00"
    },
    "_deleted": false
  },
  {
    "id": "ah-2026-07-dy-lt1k",
    "province": "安徽",
    "city": null,
    "month": "2026-07",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "peak": 1.0822,
      "flat": 0.6738,
      "valley": 0.3744,
      "purchase_agent": 0.30306,
      "line_loss": 0.0126,
      "system_cost": 0.1478,
      "transmission_distribution": 0.1814,
      "government_funds": 0.02887
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "02:00",
        "type": "flat"
      },
      {
        "start": "02:00",
        "end": "09:00",
        "type": "valley"
      },
      {
        "start": "09:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网安徽95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "皖发改价格〔2025〕302号",
    "float_rules": {
      "tip": 2.2116,
      "peak": 1.843,
      "flat": 1.0,
      "valley": 0.382,
      "base_type": "agency_trans",
      "formula_note": "尖峰=(代购+输配)×1.843×1.2+线损+系统费+基金; 低谷=(代购+输配)×(1-61.8%)+...",
      "special_period_note": "尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行（7月上旬无尖峰）"
    },
    "_deleted": false
  },
  {
    "id": "ah-2026-07-dy-1_10k",
    "province": "安徽",
    "city": null,
    "month": "2026-07",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 1.0453,
      "flat": 0.6538,
      "valley": 0.3667,
      "purchase_agent": 0.30306,
      "line_loss": 0.0126,
      "system_cost": 0.1478,
      "transmission_distribution": 0.1614,
      "government_funds": 0.02887
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "02:00",
        "type": "flat"
      },
      {
        "start": "02:00",
        "end": "09:00",
        "type": "valley"
      },
      {
        "start": "09:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网安徽95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "皖发改价格〔2025〕302号",
    "float_rules": {
      "tip": 2.2116,
      "peak": 1.843,
      "flat": 1.0,
      "valley": 0.382,
      "base_type": "agency_trans",
      "formula_note": "尖峰=(代购+输配)×1.843×1.2+线损+系统费+基金; 低谷=(代购+输配)×(1-61.8%)+...",
      "special_period_note": "尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行（7月上旬无尖峰）"
    },
    "_deleted": false
  },
  {
    "id": "ah-2026-07-dy-35k",
    "province": "安徽",
    "city": null,
    "month": "2026-07",
    "category": "单一制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 1.0084,
      "flat": 0.6338,
      "valley": 0.3591,
      "purchase_agent": 0.30306,
      "line_loss": 0.0126,
      "system_cost": 0.1478,
      "transmission_distribution": 0.1414,
      "government_funds": 0.02887
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "02:00",
        "type": "flat"
      },
      {
        "start": "02:00",
        "end": "09:00",
        "type": "valley"
      },
      {
        "start": "09:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网安徽95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "皖发改价格〔2025〕302号",
    "float_rules": {
      "tip": 2.2116,
      "peak": 1.843,
      "flat": 1.0,
      "valley": 0.382,
      "base_type": "agency_trans",
      "formula_note": "尖峰=(代购+输配)×1.843×1.2+线损+系统费+基金; 低谷=(代购+输配)×(1-61.8%)+...",
      "special_period_note": "尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行（7月上旬无尖峰）"
    },
    "_deleted": false
  },
  {
    "id": "ah-2026-07-dl-1_10k",
    "province": "安徽",
    "city": null,
    "month": "2026-07",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.1754,
      "peak": 1.011,
      "flat": 0.6352,
      "valley": 0.3596,
      "purchase_agent": 0.30306,
      "line_loss": 0.0126,
      "system_cost": 0.1478,
      "transmission_distribution": 0.1428,
      "government_funds": 0.02887,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "02:00",
        "type": "flat"
      },
      {
        "start": "02:00",
        "end": "09:00",
        "type": "valley"
      },
      {
        "start": "09:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网安徽95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "皖发改价格〔2025〕302号",
    "float_rules": {
      "tip": 2.2116,
      "peak": 1.843,
      "flat": 1.0,
      "valley": 0.382,
      "base_type": "agency_trans",
      "formula_note": "尖峰=(代购+输配)×1.843×1.2+线损+系统费+基金; 低谷=(代购+输配)×(1-61.8%)+...",
      "special_period_note": "尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行（7月上旬无尖峰）"
    },
    "_deleted": false
  },
  {
    "id": "ah-2026-07-dl-35k",
    "province": "安徽",
    "city": null,
    "month": "2026-07",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 1.1194,
      "peak": 0.9644,
      "flat": 0.6099,
      "valley": 0.35,
      "purchase_agent": 0.30306,
      "line_loss": 0.0126,
      "system_cost": 0.1478,
      "transmission_distribution": 0.1175,
      "government_funds": 0.02887,
      "demand_charge": 45.6,
      "capacity_charge": 28.5
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "02:00",
        "type": "flat"
      },
      {
        "start": "02:00",
        "end": "09:00",
        "type": "valley"
      },
      {
        "start": "09:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网安徽95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "皖发改价格〔2025〕302号",
    "float_rules": {
      "tip": 2.2116,
      "peak": 1.843,
      "flat": 1.0,
      "valley": 0.382,
      "base_type": "agency_trans",
      "formula_note": "尖峰=(代购+输配)×1.843×1.2+线损+系统费+基金; 低谷=(代购+输配)×(1-61.8%)+...",
      "special_period_note": "尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行（7月上旬无尖峰）"
    },
    "_deleted": false
  },
  {
    "id": "ah-2026-07-dl-110k",
    "province": "安徽",
    "city": null,
    "month": "2026-07",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 1.0639,
      "peak": 0.9181,
      "flat": 0.5848,
      "valley": 0.3404,
      "purchase_agent": 0.30306,
      "line_loss": 0.0126,
      "system_cost": 0.1478,
      "transmission_distribution": 0.0924,
      "government_funds": 0.02887,
      "demand_charge": 44.0,
      "capacity_charge": 27.5
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "02:00",
        "type": "flat"
      },
      {
        "start": "02:00",
        "end": "09:00",
        "type": "valley"
      },
      {
        "start": "09:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网安徽95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "皖发改价格〔2025〕302号",
    "float_rules": {
      "tip": 2.2116,
      "peak": 1.843,
      "flat": 1.0,
      "valley": 0.382,
      "base_type": "agency_trans",
      "formula_note": "尖峰=(代购+输配)×1.843×1.2+线损+系统费+基金; 低谷=(代购+输配)×(1-61.8%)+...",
      "special_period_note": "尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行（7月上旬无尖峰）"
    },
    "_deleted": false
  },
  {
    "id": "ah-2026-07-dl-220up",
    "province": "安徽",
    "city": null,
    "month": "2026-07",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 1.0084,
      "peak": 0.8719,
      "flat": 0.5597,
      "valley": 0.3308,
      "purchase_agent": 0.30306,
      "line_loss": 0.0126,
      "system_cost": 0.1478,
      "transmission_distribution": 0.0673,
      "government_funds": 0.02887,
      "demand_charge": 40.8,
      "capacity_charge": 25.5
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "02:00",
        "type": "flat"
      },
      {
        "start": "02:00",
        "end": "09:00",
        "type": "valley"
      },
      {
        "start": "09:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网安徽95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "皖发改价格〔2025〕302号",
    "float_rules": {
      "tip": 2.2116,
      "peak": 1.843,
      "flat": 1.0,
      "valley": 0.382,
      "base_type": "agency_trans",
      "formula_note": "尖峰=(代购+输配)×1.843×1.2+线损+系统费+基金; 低谷=(代购+输配)×(1-61.8%)+...",
      "special_period_note": "尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行（7月上旬无尖峰）"
    },
    "_deleted": false
  },
  {
    "id": "ah-2026-08-dy-lt1k",
    "province": "安徽",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "peak": 1.108,
      "flat": 0.6736,
      "valley": 0.3551,
      "purchase_agent": 0.31399,
      "line_loss": 0.0127,
      "system_cost": 0.1166,
      "transmission_distribution": 0.2014,
      "government_funds": 0.02887
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "02:00",
        "type": "flat"
      },
      {
        "start": "02:00",
        "end": "09:00",
        "type": "valley"
      },
      {
        "start": "09:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网安徽95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "皖发改价格〔2025〕302号",
    "float_rules": {
      "tip": "高峰基础上再上浮20% (×1.2)",
      "peak": {
        "夏冬季": 1.843,
        "其他月份": 1.74
      },
      "valley": 0.382,
      "deep": "低谷基础上下浮20% (×0.8)",
      "base_type": "agency_plus_transmission",
      "formula_note": "尖峰=(代购+输配)×1.843×1.2+线损+系统费+基金; 低谷=(代购+输配)×(1-61.8%)+...",
      "special_period_note": "尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行"
    },
    "_deleted": false
  },
  {
    "id": "ah-2026-08-dy-1_10k",
    "province": "安徽",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 1.0675,
      "flat": 0.6516,
      "valley": 0.3466,
      "purchase_agent": 0.31399,
      "line_loss": 0.0127,
      "system_cost": 0.1166,
      "transmission_distribution": 0.1794,
      "government_funds": 0.02887
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "02:00",
        "type": "flat"
      },
      {
        "start": "02:00",
        "end": "09:00",
        "type": "valley"
      },
      {
        "start": "09:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网安徽95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "皖发改价格〔2025〕302号",
    "float_rules": {
      "tip": "高峰基础上再上浮20% (×1.2)",
      "peak": {
        "夏冬季": 1.843,
        "其他月份": 1.74
      },
      "valley": 0.382,
      "deep": "低谷基础上下浮20% (×0.8)",
      "base_type": "agency_plus_transmission",
      "formula_note": "尖峰=(代购+输配)×1.843×1.2+线损+系统费+基金; 低谷=(代购+输配)×(1-61.8%)+...",
      "special_period_note": "尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行"
    },
    "_deleted": false
  },
  {
    "id": "ah-2026-08-dy-35k",
    "province": "安徽",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 1.0269,
      "flat": 0.6296,
      "valley": 0.3382,
      "purchase_agent": 0.31399,
      "line_loss": 0.0127,
      "system_cost": 0.1166,
      "transmission_distribution": 0.1574,
      "government_funds": 0.02887
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "02:00",
        "type": "flat"
      },
      {
        "start": "02:00",
        "end": "09:00",
        "type": "valley"
      },
      {
        "start": "09:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网安徽95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "皖发改价格〔2025〕302号",
    "float_rules": {
      "tip": "高峰基础上再上浮20% (×1.2)",
      "peak": {
        "夏冬季": 1.843,
        "其他月份": 1.74
      },
      "valley": 0.382,
      "deep": "低谷基础上下浮20% (×0.8)",
      "base_type": "agency_plus_transmission",
      "formula_note": "尖峰=(代购+输配)×1.843×1.2+线损+系统费+基金; 低谷=(代购+输配)×(1-61.8%)+...",
      "special_period_note": "尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行"
    },
    "_deleted": false
  },
  {
    "id": "ah-2026-08-dy-110k",
    "province": "安徽",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.9846,
      "flat": 0.6066,
      "valley": 0.3295,
      "purchase_agent": 0.31399,
      "line_loss": 0.0127,
      "system_cost": 0.1166,
      "transmission_distribution": 0.1344,
      "government_funds": 0.02887
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "02:00",
        "type": "flat"
      },
      {
        "start": "02:00",
        "end": "09:00",
        "type": "valley"
      },
      {
        "start": "09:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网安徽95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "皖发改价格〔2025〕302号",
    "float_rules": {
      "tip": "高峰基础上再上浮20% (×1.2)",
      "peak": {
        "夏冬季": 1.843,
        "其他月份": 1.74
      },
      "valley": 0.382,
      "deep": "低谷基础上下浮20% (×0.8)",
      "base_type": "agency_plus_transmission",
      "formula_note": "尖峰=(代购+输配)×1.843×1.2+线损+系统费+基金; 低谷=(代购+输配)×(1-61.8%)+...",
      "special_period_note": "尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行"
    },
    "_deleted": false
  },
  {
    "id": "ah-2026-08-dy-220up",
    "province": "安徽",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.9293,
      "flat": 0.5766,
      "valley": 0.318,
      "purchase_agent": 0.31399,
      "line_loss": 0.0127,
      "system_cost": 0.1166,
      "transmission_distribution": 0.1044,
      "government_funds": 0.02887
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "02:00",
        "type": "flat"
      },
      {
        "start": "02:00",
        "end": "09:00",
        "type": "valley"
      },
      {
        "start": "09:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网安徽95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "皖发改价格〔2025〕302号",
    "float_rules": {
      "tip": "高峰基础上再上浮20% (×1.2)",
      "peak": {
        "夏冬季": 1.843,
        "其他月份": 1.74
      },
      "valley": 0.382,
      "deep": "低谷基础上下浮20% (×0.8)",
      "base_type": "agency_plus_transmission",
      "formula_note": "尖峰=(代购+输配)×1.843×1.2+线损+系统费+基金; 低谷=(代购+输配)×(1-61.8%)+...",
      "special_period_note": "尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行"
    },
    "_deleted": false
  },
  {
    "id": "ah-2026-08-dl-1_10k",
    "province": "安徽",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.1454,
      "peak": 0.9809,
      "flat": 0.6046,
      "valley": 0.3287,
      "purchase_agent": 0.31399,
      "line_loss": 0.0127,
      "system_cost": 0.1166,
      "transmission_distribution": 0.1324,
      "government_funds": 0.02887,
      "demand_charge": 46.4,
      "capacity_charge": 29.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "02:00",
        "type": "flat"
      },
      {
        "start": "02:00",
        "end": "09:00",
        "type": "valley"
      },
      {
        "start": "09:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网安徽95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "皖发改价格〔2025〕302号",
    "float_rules": {
      "tip": "高峰基础上再上浮20% (×1.2)",
      "peak": {
        "夏冬季": 1.843,
        "其他月份": 1.74
      },
      "valley": 0.382,
      "deep": "低谷基础上下浮20% (×0.8)",
      "base_type": "agency_plus_transmission",
      "formula_note": "尖峰=(代购+输配)×1.843×1.2+线损+系统费+基金; 低谷=(代购+输配)×(1-61.8%)+...",
      "special_period_note": "尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行"
    },
    "_deleted": false
  },
  {
    "id": "ah-2026-08-dl-35k",
    "province": "安徽",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 1.0892,
      "peak": 0.9341,
      "flat": 0.5792,
      "valley": 0.319,
      "purchase_agent": 0.31399,
      "line_loss": 0.0127,
      "system_cost": 0.1166,
      "transmission_distribution": 0.107,
      "government_funds": 0.02887,
      "demand_charge": 43.2,
      "capacity_charge": 27.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "02:00",
        "type": "flat"
      },
      {
        "start": "02:00",
        "end": "09:00",
        "type": "valley"
      },
      {
        "start": "09:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网安徽95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "皖发改价格〔2025〕302号",
    "float_rules": {
      "tip": "高峰基础上再上浮20% (×1.2)",
      "peak": {
        "夏冬季": 1.843,
        "其他月份": 1.74
      },
      "valley": 0.382,
      "deep": "低谷基础上下浮20% (×0.8)",
      "base_type": "agency_plus_transmission",
      "formula_note": "尖峰=(代购+输配)×1.843×1.2+线损+系统费+基金; 低谷=(代购+输配)×(1-61.8%)+...",
      "special_period_note": "尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行"
    },
    "_deleted": false
  },
  {
    "id": "ah-2026-08-dl-110k",
    "province": "安徽",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 1.0315,
      "peak": 0.886,
      "flat": 0.5531,
      "valley": 0.309,
      "purchase_agent": 0.31399,
      "line_loss": 0.0127,
      "system_cost": 0.1166,
      "transmission_distribution": 0.0809,
      "government_funds": 0.02887,
      "demand_charge": 40.8,
      "capacity_charge": 25.5
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "02:00",
        "type": "flat"
      },
      {
        "start": "02:00",
        "end": "09:00",
        "type": "valley"
      },
      {
        "start": "09:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网安徽95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "皖发改价格〔2025〕302号",
    "float_rules": {
      "tip": "高峰基础上再上浮20% (×1.2)",
      "peak": {
        "夏冬季": 1.843,
        "其他月份": 1.74
      },
      "valley": 0.382,
      "deep": "低谷基础上下浮20% (×0.8)",
      "base_type": "agency_plus_transmission",
      "formula_note": "尖峰=(代购+输配)×1.843×1.2+线损+系统费+基金; 低谷=(代购+输配)×(1-61.8%)+...",
      "special_period_note": "尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行"
    },
    "_deleted": false
  },
  {
    "id": "ah-2026-08-dl-220up",
    "province": "安徽",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 0.9738,
      "peak": 0.8379,
      "flat": 0.527,
      "valley": 0.2991,
      "purchase_agent": 0.31399,
      "line_loss": 0.0127,
      "system_cost": 0.1166,
      "transmission_distribution": 0.0548,
      "government_funds": 0.02887,
      "demand_charge": 38.4,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "02:00",
        "type": "flat"
      },
      {
        "start": "02:00",
        "end": "09:00",
        "type": "valley"
      },
      {
        "start": "09:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网安徽95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "皖发改价格〔2025〕302号",
    "float_rules": {
      "tip": "高峰基础上再上浮20% (×1.2)",
      "peak": {
        "夏冬季": 1.843,
        "其他月份": 1.74
      },
      "valley": 0.382,
      "deep": "低谷基础上下浮20% (×0.8)",
      "base_type": "agency_plus_transmission",
      "formula_note": "尖峰=(代购+输配)×1.843×1.2+线损+系统费+基金; 低谷=(代购+输配)×(1-61.8%)+...",
      "special_period_note": "尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行"
    },
    "_deleted": false
  },
  {
    "id": "js-2026-08-dl-1_10k",
    "province": "江苏",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.0597,
      "peak": 0.9217,
      "flat": 0.6151,
      "valley": 0.366,
      "line_loss": 0.0115,
      "system_cost": 0.0612,
      "transmission_distribution": 0.1298,
      "government_funds": 0.0294,
      "demand_charge": 51.2,
      "capacity_charge": 32.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "flat"
      },
      {
        "start": "13:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江苏95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "苏发改价格发〔2024〕119号",
    "float_rules": {
      "tip": "高峰基础再上浮20% (×1.2)",
      "peak": 1.8,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_only",
      "formula_note": "分时电价=代购电价×浮动比例+输配+线损+系统费+基金",
      "special_period_note": "7-8月夏季执行尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "js-2026-08-dl-35k",
    "province": "江苏",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 1.0347,
      "peak": 0.8967,
      "flat": 0.5901,
      "valley": 0.341,
      "line_loss": 0.0115,
      "system_cost": 0.0612,
      "transmission_distribution": 0.1048,
      "government_funds": 0.0294,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "flat"
      },
      {
        "start": "13:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江苏95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "苏发改价格发〔2024〕119号",
    "float_rules": {
      "tip": "高峰基础再上浮20% (×1.2)",
      "peak": 1.8,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_only",
      "formula_note": "分时电价=代购电价×浮动比例+输配+线损+系统费+基金",
      "special_period_note": "7-8月夏季执行尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "js-2026-08-dl-110k",
    "province": "江苏",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 1.0087,
      "peak": 0.8707,
      "flat": 0.5641,
      "valley": 0.315,
      "line_loss": 0.0115,
      "system_cost": 0.0612,
      "transmission_distribution": 0.0788,
      "government_funds": 0.0294,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "flat"
      },
      {
        "start": "13:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江苏95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "苏发改价格发〔2024〕119号",
    "float_rules": {
      "tip": "高峰基础再上浮20% (×1.2)",
      "peak": 1.8,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_only",
      "formula_note": "分时电价=代购电价×浮动比例+输配+线损+系统费+基金",
      "special_period_note": "7-8月夏季执行尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "js-2026-08-dl-220up",
    "province": "江苏",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 0.9817,
      "peak": 0.8437,
      "flat": 0.5371,
      "valley": 0.288,
      "line_loss": 0.0115,
      "system_cost": 0.0612,
      "transmission_distribution": 0.0518,
      "government_funds": 0.0294,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "flat"
      },
      {
        "start": "13:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江苏95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "苏发改价格发〔2024〕119号",
    "float_rules": {
      "tip": "高峰基础再上浮20% (×1.2)",
      "peak": 1.8,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_only",
      "formula_note": "分时电价=代购电价×浮动比例+输配+线损+系统费+基金",
      "special_period_note": "7-8月夏季执行尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "js-2026-08-dy-lt1k",
    "province": "江苏",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "tip": 1.1229,
      "peak": 0.9926,
      "flat": 0.7244,
      "valley": 0.4753,
      "line_loss": 0.0115,
      "system_cost": 0.0612,
      "transmission_distribution": 0.2391,
      "government_funds": 0.0294,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "flat"
      },
      {
        "start": "13:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江苏95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "苏发改价格发〔2024〕119号",
    "float_rules": {
      "tip": "高峰基础再上浮20% (×1.2)",
      "peak": 1.8,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_only",
      "formula_note": "分时电价=代购电价×浮动比例+输配+线损+系统费+基金",
      "special_period_note": "7-8月夏季执行尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "js-2026-08-dy-1_10k",
    "province": "江苏",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.0969,
      "peak": 0.9666,
      "flat": 0.6984,
      "valley": 0.4493,
      "line_loss": 0.0115,
      "system_cost": 0.0612,
      "transmission_distribution": 0.2131,
      "government_funds": 0.0294,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "flat"
      },
      {
        "start": "13:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江苏95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "苏发改价格发〔2024〕119号",
    "float_rules": {
      "tip": "高峰基础再上浮20% (×1.2)",
      "peak": 1.8,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_only",
      "formula_note": "分时电价=代购电价×浮动比例+输配+线损+系统费+基金",
      "special_period_note": "7-8月夏季执行尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "js-2026-08-dy-35k",
    "province": "江苏",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 1.0719,
      "peak": 0.9416,
      "flat": 0.6734,
      "valley": 0.4243,
      "line_loss": 0.0115,
      "system_cost": 0.0612,
      "transmission_distribution": 0.1881,
      "government_funds": 0.0294,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "flat"
      },
      {
        "start": "13:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江苏95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "苏发改价格发〔2024〕119号",
    "float_rules": {
      "tip": "高峰基础再上浮20% (×1.2)",
      "peak": 1.8,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_only",
      "formula_note": "分时电价=代购电价×浮动比例+输配+线损+系统费+基金",
      "special_period_note": "7-8月夏季执行尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "js-2026-08-dy-110k",
    "province": "江苏",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 1.0459,
      "peak": 0.9156,
      "flat": 0.6474,
      "valley": 0.3983,
      "line_loss": 0.0115,
      "system_cost": 0.0612,
      "transmission_distribution": 0.1621,
      "government_funds": 0.0294,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "flat"
      },
      {
        "start": "13:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江苏95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "苏发改价格发〔2024〕119号",
    "float_rules": {
      "tip": "高峰基础再上浮20% (×1.2)",
      "peak": 1.8,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_only",
      "formula_note": "分时电价=代购电价×浮动比例+输配+线损+系统费+基金",
      "special_period_note": "7-8月夏季执行尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "js-2026-08-dy-220up",
    "province": "江苏",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 1.0189,
      "peak": 0.8886,
      "flat": 0.6204,
      "valley": 0.3713,
      "line_loss": 0.0115,
      "system_cost": 0.0612,
      "transmission_distribution": 0.1351,
      "government_funds": 0.0294,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "flat"
      },
      {
        "start": "13:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江苏95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "苏发改价格发〔2024〕119号",
    "float_rules": {
      "tip": "高峰基础再上浮20% (×1.2)",
      "peak": 1.8,
      "flat": 1.0,
      "valley": 0.4,
      "base_type": "agency_only",
      "formula_note": "分时电价=代购电价×浮动比例+输配+线损+系统费+基金",
      "special_period_note": "7-8月夏季执行尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "jx-2026-08-dy-lt1k",
    "province": "江西",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "tip": 1.0088947,
      "peak": 0.9271119,
      "flat": 0.6817635,
      "valley": 0.4364151,
      "deep": 0.3955237,
      "purchase_agent": 0.408914,
      "line_loss": 0.016077,
      "system_cost": 0.03842,
      "transmission_distribution": 0.1916,
      "government_funds": 0.0267525
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "01:00",
        "type": "flat"
      },
      {
        "start": "01:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "11:30",
        "type": "flat"
      },
      {
        "start": "11:30",
        "end": "14:30",
        "type": "valley"
      },
      {
        "start": "14:30",
        "end": "17:00",
        "type": "flat"
      },
      {
        "start": "17:00",
        "end": "20:30",
        "type": "peak"
      },
      {
        "start": "20:30",
        "end": "22:30",
        "type": "tip"
      },
      {
        "start": "22:30",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "赣发改价管〔2023〕901号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.3,
      "base_type": "agency_only",
      "formula_note": "浮动比例 1.6:1:0.4，尖峰上浮80%，深谷下浮70%；线损、输配、系统费、基金不参与浮动",
      "special_period_note": "7-8月尖峰 20:30-22:30"
    },
    "_deleted": false
  },
  {
    "id": "jx-2026-08-dy-1_10k",
    "province": "江西",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 0.9888947,
      "peak": 0.9071119,
      "flat": 0.6617635,
      "valley": 0.4164151,
      "deep": 0.3755237,
      "purchase_agent": 0.408914,
      "line_loss": 0.016077,
      "system_cost": 0.03842,
      "transmission_distribution": 0.1716,
      "government_funds": 0.0267525
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "01:00",
        "type": "flat"
      },
      {
        "start": "01:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "11:30",
        "type": "flat"
      },
      {
        "start": "11:30",
        "end": "14:30",
        "type": "valley"
      },
      {
        "start": "14:30",
        "end": "17:00",
        "type": "flat"
      },
      {
        "start": "17:00",
        "end": "20:30",
        "type": "peak"
      },
      {
        "start": "20:30",
        "end": "22:30",
        "type": "tip"
      },
      {
        "start": "22:30",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "赣发改价管〔2023〕901号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.3,
      "base_type": "agency_only",
      "formula_note": "浮动比例 1.6:1:0.4，尖峰上浮80%，深谷下浮70%；线损、输配、系统费、基金不参与浮动",
      "special_period_note": "7-8月尖峰 20:30-22:30"
    },
    "_deleted": false
  },
  {
    "id": "jx-2026-08-dy-35k",
    "province": "江西",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 0.9688947,
      "peak": 0.8871119,
      "flat": 0.6417635,
      "valley": 0.3964151,
      "deep": 0.3555237,
      "purchase_agent": 0.408914,
      "line_loss": 0.016077,
      "system_cost": 0.03842,
      "transmission_distribution": 0.1516,
      "government_funds": 0.0267525
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "01:00",
        "type": "flat"
      },
      {
        "start": "01:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "11:30",
        "type": "flat"
      },
      {
        "start": "11:30",
        "end": "14:30",
        "type": "valley"
      },
      {
        "start": "14:30",
        "end": "17:00",
        "type": "flat"
      },
      {
        "start": "17:00",
        "end": "20:30",
        "type": "peak"
      },
      {
        "start": "20:30",
        "end": "22:30",
        "type": "tip"
      },
      {
        "start": "22:30",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "赣发改价管〔2023〕901号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.3,
      "base_type": "agency_only",
      "formula_note": "浮动比例 1.6:1:0.4，尖峰上浮80%，深谷下浮70%；线损、输配、系统费、基金不参与浮动",
      "special_period_note": "7-8月尖峰 20:30-22:30"
    },
    "_deleted": false
  },
  {
    "id": "jx-2026-08-dy-110k",
    "province": "江西",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 0.9488947,
      "peak": 0.8671119,
      "flat": 0.6217635,
      "valley": 0.3764151,
      "deep": 0.3355237,
      "purchase_agent": 0.408914,
      "line_loss": 0.016077,
      "system_cost": 0.03842,
      "transmission_distribution": 0.1316,
      "government_funds": 0.0267525
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "01:00",
        "type": "flat"
      },
      {
        "start": "01:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "11:30",
        "type": "flat"
      },
      {
        "start": "11:30",
        "end": "14:30",
        "type": "valley"
      },
      {
        "start": "14:30",
        "end": "17:00",
        "type": "flat"
      },
      {
        "start": "17:00",
        "end": "20:30",
        "type": "peak"
      },
      {
        "start": "20:30",
        "end": "22:30",
        "type": "tip"
      },
      {
        "start": "22:30",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "赣发改价管〔2023〕901号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.3,
      "base_type": "agency_only",
      "formula_note": "浮动比例 1.6:1:0.4，尖峰上浮80%，深谷下浮70%；线损、输配、系统费、基金不参与浮动",
      "special_period_note": "7-8月尖峰 20:30-22:30"
    },
    "_deleted": false
  },
  {
    "id": "jx-2026-08-dy-220up",
    "province": "江西",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 0.9338947,
      "peak": 0.8521119,
      "flat": 0.6067635,
      "valley": 0.3614151,
      "deep": 0.3205237,
      "purchase_agent": 0.408914,
      "line_loss": 0.016077,
      "system_cost": 0.03842,
      "transmission_distribution": 0.1166,
      "government_funds": 0.0267525
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "01:00",
        "type": "flat"
      },
      {
        "start": "01:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "11:30",
        "type": "flat"
      },
      {
        "start": "11:30",
        "end": "14:30",
        "type": "valley"
      },
      {
        "start": "14:30",
        "end": "17:00",
        "type": "flat"
      },
      {
        "start": "17:00",
        "end": "20:30",
        "type": "peak"
      },
      {
        "start": "20:30",
        "end": "22:30",
        "type": "tip"
      },
      {
        "start": "22:30",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "赣发改价管〔2023〕901号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.3,
      "base_type": "agency_only",
      "formula_note": "浮动比例 1.6:1:0.4，尖峰上浮80%，深谷下浮70%；线损、输配、系统费、基金不参与浮动",
      "special_period_note": "7-8月尖峰 20:30-22:30"
    },
    "_deleted": false
  },
  {
    "id": "jx-2026-08-dl-1_10k",
    "province": "江西",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 0.9657947,
      "peak": 0.8840119,
      "flat": 0.6386635,
      "valley": 0.3933151,
      "deep": 0.3524237,
      "purchase_agent": 0.408914,
      "line_loss": 0.016077,
      "system_cost": 0.03842,
      "transmission_distribution": 0.1485,
      "government_funds": 0.0267525,
      "demand_charge": 42.3,
      "capacity_charge": 26.4
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "01:00",
        "type": "flat"
      },
      {
        "start": "01:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "11:30",
        "type": "flat"
      },
      {
        "start": "11:30",
        "end": "14:30",
        "type": "valley"
      },
      {
        "start": "14:30",
        "end": "17:00",
        "type": "flat"
      },
      {
        "start": "17:00",
        "end": "20:30",
        "type": "peak"
      },
      {
        "start": "20:30",
        "end": "22:30",
        "type": "tip"
      },
      {
        "start": "22:30",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "赣发改价管〔2023〕901号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.3,
      "base_type": "agency_only",
      "formula_note": "浮动比例 1.6:1:0.4，尖峰上浮80%，深谷下浮70%；线损、输配、系统费、基金不参与浮动",
      "special_period_note": "7-8月尖峰 20:30-22:30"
    },
    "_deleted": false
  },
  {
    "id": "jx-2026-08-dl-35k",
    "province": "江西",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 0.9457947,
      "peak": 0.8640119,
      "flat": 0.6186635,
      "valley": 0.3733151,
      "deep": 0.3324237,
      "purchase_agent": 0.408914,
      "line_loss": 0.016077,
      "system_cost": 0.03842,
      "transmission_distribution": 0.1285,
      "government_funds": 0.0267525,
      "demand_charge": 40.6,
      "capacity_charge": 25.4
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "01:00",
        "type": "flat"
      },
      {
        "start": "01:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "11:30",
        "type": "flat"
      },
      {
        "start": "11:30",
        "end": "14:30",
        "type": "valley"
      },
      {
        "start": "14:30",
        "end": "17:00",
        "type": "flat"
      },
      {
        "start": "17:00",
        "end": "20:30",
        "type": "peak"
      },
      {
        "start": "20:30",
        "end": "22:30",
        "type": "tip"
      },
      {
        "start": "22:30",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "赣发改价管〔2023〕901号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.3,
      "base_type": "agency_only",
      "formula_note": "浮动比例 1.6:1:0.4，尖峰上浮80%，深谷下浮70%；线损、输配、系统费、基金不参与浮动",
      "special_period_note": "7-8月尖峰 20:30-22:30"
    },
    "_deleted": false
  },
  {
    "id": "jx-2026-08-dl-110k",
    "province": "江西",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 0.9257947,
      "peak": 0.8440119,
      "flat": 0.5986635,
      "valley": 0.3533151,
      "deep": 0.3124237,
      "purchase_agent": 0.408914,
      "line_loss": 0.016077,
      "system_cost": 0.03842,
      "transmission_distribution": 0.1085,
      "government_funds": 0.0267525,
      "demand_charge": 39.1,
      "capacity_charge": 24.4
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "01:00",
        "type": "flat"
      },
      {
        "start": "01:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "11:30",
        "type": "flat"
      },
      {
        "start": "11:30",
        "end": "14:30",
        "type": "valley"
      },
      {
        "start": "14:30",
        "end": "17:00",
        "type": "flat"
      },
      {
        "start": "17:00",
        "end": "20:30",
        "type": "peak"
      },
      {
        "start": "20:30",
        "end": "22:30",
        "type": "tip"
      },
      {
        "start": "22:30",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "赣发改价管〔2023〕901号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.3,
      "base_type": "agency_only",
      "formula_note": "浮动比例 1.6:1:0.4，尖峰上浮80%，深谷下浮70%；线损、输配、系统费、基金不参与浮动",
      "special_period_note": "7-8月尖峰 20:30-22:30"
    },
    "_deleted": false
  },
  {
    "id": "jx-2026-08-dl-220up",
    "province": "江西",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 0.9107947,
      "peak": 0.8290119,
      "flat": 0.5836635,
      "valley": 0.3383151,
      "deep": 0.2974237,
      "purchase_agent": 0.408914,
      "line_loss": 0.016077,
      "system_cost": 0.03842,
      "transmission_distribution": 0.0935,
      "government_funds": 0.0267525,
      "demand_charge": 37.5,
      "capacity_charge": 23.4
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "01:00",
        "type": "flat"
      },
      {
        "start": "01:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "11:30",
        "type": "flat"
      },
      {
        "start": "11:30",
        "end": "14:30",
        "type": "valley"
      },
      {
        "start": "14:30",
        "end": "17:00",
        "type": "flat"
      },
      {
        "start": "17:00",
        "end": "20:30",
        "type": "peak"
      },
      {
        "start": "20:30",
        "end": "22:30",
        "type": "tip"
      },
      {
        "start": "22:30",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网江西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "赣发改价管〔2023〕901号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.3,
      "base_type": "agency_only",
      "formula_note": "浮动比例 1.6:1:0.4，尖峰上浮80%，深谷下浮70%；线损、输配、系统费、基金不参与浮动",
      "special_period_note": "7-8月尖峰 20:30-22:30"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-08-dl-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2025-08",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.239,
      "peak": 1.0325,
      "flat": 0.6257,
      "valley": 0.2378,
      "purchase_agent": 0.4108,
      "line_loss": 0.0138,
      "system_cost": 0.0459,
      "transmission_distribution": 0.126,
      "government_funds": 0.0292,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-08-dl-35k",
    "province": "浙江",
    "city": null,
    "month": "2025-08",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 1.1786,
      "peak": 0.9821,
      "flat": 0.5952,
      "valley": 0.2262,
      "purchase_agent": 0.4108,
      "line_loss": 0.0138,
      "system_cost": 0.0459,
      "transmission_distribution": 0.0955,
      "government_funds": 0.0292,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-08-dl-110k",
    "province": "浙江",
    "city": null,
    "month": "2025-08",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 1.1461,
      "peak": 0.9551,
      "flat": 0.5788,
      "valley": 0.22,
      "purchase_agent": 0.4108,
      "line_loss": 0.0138,
      "system_cost": 0.0459,
      "transmission_distribution": 0.0791,
      "government_funds": 0.0292,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-08-dl-220up",
    "province": "浙江",
    "city": null,
    "month": "2025-08",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 1.1257,
      "peak": 0.9381,
      "flat": 0.5685,
      "valley": 0.216,
      "purchase_agent": 0.4108,
      "line_loss": 0.0138,
      "system_cost": 0.0459,
      "transmission_distribution": 0.0688,
      "government_funds": 0.0292,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-08-gs-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2025-08",
    "category": "两部制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.0325,
      "peak": 0.9386,
      "flat": 0.6257,
      "valley": 0.2378,
      "purchase_agent": 0.4108,
      "line_loss": 0.0138,
      "system_cost": 0.0459,
      "transmission_distribution": 0.126,
      "government_funds": 0.0292,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-08-gs-35k",
    "province": "浙江",
    "city": null,
    "month": "2025-08",
    "category": "两部制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 0.9821,
      "peak": 0.8929,
      "flat": 0.5952,
      "valley": 0.2262,
      "purchase_agent": 0.4108,
      "line_loss": 0.0138,
      "system_cost": 0.0459,
      "transmission_distribution": 0.0955,
      "government_funds": 0.0292,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-08-gs-110k",
    "province": "浙江",
    "city": null,
    "month": "2025-08",
    "category": "两部制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 0.9551,
      "peak": 0.8683,
      "flat": 0.5788,
      "valley": 0.22,
      "purchase_agent": 0.4108,
      "line_loss": 0.0138,
      "system_cost": 0.0459,
      "transmission_distribution": 0.0791,
      "government_funds": 0.0292,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-08-gs-220up",
    "province": "浙江",
    "city": null,
    "month": "2025-08",
    "category": "两部制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 0.9381,
      "peak": 0.8528,
      "flat": 0.5685,
      "valley": 0.216,
      "purchase_agent": 0.4108,
      "line_loss": 0.0138,
      "system_cost": 0.0459,
      "transmission_distribution": 0.0688,
      "government_funds": 0.0292,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-08-dy-lt1k",
    "province": "浙江",
    "city": null,
    "month": "2025-08",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "tip": 1.2146,
      "peak": 1.1042,
      "flat": 0.7361,
      "valley": 0.2797,
      "purchase_agent": 0.4108,
      "line_loss": 0.0138,
      "system_cost": 0.0371,
      "transmission_distribution": 0.2452,
      "government_funds": 0.0292
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-08-dy-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2025-08",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.1783,
      "peak": 1.0712,
      "flat": 0.7141,
      "valley": 0.2714,
      "purchase_agent": 0.4108,
      "line_loss": 0.0138,
      "system_cost": 0.0459,
      "transmission_distribution": 0.2144,
      "government_funds": 0.0292
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-08-dy-35up",
    "province": "浙江",
    "city": null,
    "month": "2025-08",
    "category": "单一制-工商业",
    "voltage_level": "35kV及以上",
    "prices": {
      "tip": 1.1166,
      "peak": 1.0151,
      "flat": 0.6767,
      "valley": 0.2572,
      "purchase_agent": 0.4108,
      "line_loss": 0.0138,
      "system_cost": 0.0459,
      "transmission_distribution": 0.177,
      "government_funds": 0.0292
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-09-dl-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2025-09",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 1.0318,
      "flat": 0.6253,
      "valley": 0.2814,
      "purchase_agent": 0.4309,
      "line_loss": 0.013,
      "system_cost": 0.0262,
      "transmission_distribution": 0.126,
      "government_funds": 0.0292,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-09-dl-35k",
    "province": "浙江",
    "city": null,
    "month": "2025-09",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.9815,
      "flat": 0.5948,
      "valley": 0.2677,
      "purchase_agent": 0.4309,
      "line_loss": 0.013,
      "system_cost": 0.0262,
      "transmission_distribution": 0.0955,
      "government_funds": 0.0292,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-09-dl-110k",
    "province": "浙江",
    "city": null,
    "month": "2025-09",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.9544,
      "flat": 0.5784,
      "valley": 0.2603,
      "purchase_agent": 0.4309,
      "line_loss": 0.013,
      "system_cost": 0.0262,
      "transmission_distribution": 0.0791,
      "government_funds": 0.0292,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-09-dl-220up",
    "province": "浙江",
    "city": null,
    "month": "2025-09",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.9374,
      "flat": 0.5681,
      "valley": 0.2557,
      "purchase_agent": 0.4309,
      "line_loss": 0.013,
      "system_cost": 0.0262,
      "transmission_distribution": 0.0688,
      "government_funds": 0.0292,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-09-gs-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2025-09",
    "category": "两部制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.938,
      "flat": 0.6253,
      "valley": 0.2814,
      "purchase_agent": 0.4309,
      "line_loss": 0.013,
      "system_cost": 0.0262,
      "transmission_distribution": 0.126,
      "government_funds": 0.0292,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-09-gs-35k",
    "province": "浙江",
    "city": null,
    "month": "2025-09",
    "category": "两部制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.8923,
      "flat": 0.5948,
      "valley": 0.2677,
      "purchase_agent": 0.4309,
      "line_loss": 0.013,
      "system_cost": 0.0262,
      "transmission_distribution": 0.0955,
      "government_funds": 0.0292,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-09-gs-110k",
    "province": "浙江",
    "city": null,
    "month": "2025-09",
    "category": "两部制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.8677,
      "flat": 0.5784,
      "valley": 0.2603,
      "purchase_agent": 0.4309,
      "line_loss": 0.013,
      "system_cost": 0.0262,
      "transmission_distribution": 0.0791,
      "government_funds": 0.0292,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-09-gs-220up",
    "province": "浙江",
    "city": null,
    "month": "2025-09",
    "category": "两部制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.8522,
      "flat": 0.5681,
      "valley": 0.2557,
      "purchase_agent": 0.4309,
      "line_loss": 0.013,
      "system_cost": 0.0262,
      "transmission_distribution": 0.0688,
      "government_funds": 0.0292,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-09-dy-lt1k",
    "province": "浙江",
    "city": null,
    "month": "2025-09",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "peak": 1.0975,
      "flat": 0.7316,
      "valley": 0.3292,
      "purchase_agent": 0.4309,
      "line_loss": 0.013,
      "system_cost": 0.0133,
      "transmission_distribution": 0.2452,
      "government_funds": 0.0292
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-09-dy-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2025-09",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 1.0706,
      "flat": 0.7137,
      "valley": 0.3212,
      "purchase_agent": 0.4309,
      "line_loss": 0.013,
      "system_cost": 0.0262,
      "transmission_distribution": 0.2144,
      "government_funds": 0.0292
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-09-dy-35up",
    "province": "浙江",
    "city": null,
    "month": "2025-09",
    "category": "单一制-工商业",
    "voltage_level": "35kV及以上",
    "prices": {
      "peak": 1.0145,
      "flat": 0.6763,
      "valley": 0.3044,
      "purchase_agent": 0.4309,
      "line_loss": 0.013,
      "system_cost": 0.0262,
      "transmission_distribution": 0.177,
      "government_funds": 0.0292
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-10-dl-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2025-10",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 1.0417,
      "flat": 0.6313,
      "valley": 0.2841,
      "deep": 0.1263,
      "purchase_agent": 0.4421,
      "line_loss": 0.0127,
      "system_cost": 0.0213,
      "transmission_distribution": 0.126,
      "government_funds": 0.0292,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-10-dl-35k",
    "province": "浙江",
    "city": null,
    "month": "2025-10",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.9914,
      "flat": 0.6008,
      "valley": 0.2704,
      "deep": 0.1202,
      "purchase_agent": 0.4421,
      "line_loss": 0.0127,
      "system_cost": 0.0213,
      "transmission_distribution": 0.0955,
      "government_funds": 0.0292,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-10-dl-110k",
    "province": "浙江",
    "city": null,
    "month": "2025-10",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.9643,
      "flat": 0.5844,
      "valley": 0.263,
      "deep": 0.1169,
      "purchase_agent": 0.4421,
      "line_loss": 0.0127,
      "system_cost": 0.0213,
      "transmission_distribution": 0.0791,
      "government_funds": 0.0292,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-10-dl-220up",
    "province": "浙江",
    "city": null,
    "month": "2025-10",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.9473,
      "flat": 0.5741,
      "valley": 0.2584,
      "deep": 0.1148,
      "purchase_agent": 0.4421,
      "line_loss": 0.0127,
      "system_cost": 0.0213,
      "transmission_distribution": 0.0688,
      "government_funds": 0.0292,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-10-gs-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2025-10",
    "category": "两部制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.947,
      "flat": 0.6313,
      "valley": 0.2841,
      "deep": 0.1263,
      "purchase_agent": 0.4421,
      "line_loss": 0.0127,
      "system_cost": 0.0213,
      "transmission_distribution": 0.126,
      "government_funds": 0.0292,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-10-gs-35k",
    "province": "浙江",
    "city": null,
    "month": "2025-10",
    "category": "两部制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.9013,
      "flat": 0.6008,
      "valley": 0.2704,
      "deep": 0.1202,
      "purchase_agent": 0.4421,
      "line_loss": 0.0127,
      "system_cost": 0.0213,
      "transmission_distribution": 0.0955,
      "government_funds": 0.0292,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-10-gs-110k",
    "province": "浙江",
    "city": null,
    "month": "2025-10",
    "category": "两部制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.8767,
      "flat": 0.5844,
      "valley": 0.263,
      "deep": 0.1169,
      "purchase_agent": 0.4421,
      "line_loss": 0.0127,
      "system_cost": 0.0213,
      "transmission_distribution": 0.0791,
      "government_funds": 0.0292,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-10-gs-220up",
    "province": "浙江",
    "city": null,
    "month": "2025-10",
    "category": "两部制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.8612,
      "flat": 0.5741,
      "valley": 0.2584,
      "deep": 0.1148,
      "purchase_agent": 0.4421,
      "line_loss": 0.0127,
      "system_cost": 0.0213,
      "transmission_distribution": 0.0688,
      "government_funds": 0.0292,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-10-dy-lt1k",
    "province": "浙江",
    "city": null,
    "month": "2025-10",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "peak": 1.1102,
      "flat": 0.7401,
      "valley": 0.3331,
      "deep": 0.148,
      "purchase_agent": 0.4421,
      "line_loss": 0.0127,
      "system_cost": 0.0109,
      "transmission_distribution": 0.2452,
      "government_funds": 0.0292
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-10-dy-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2025-10",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 1.0796,
      "flat": 0.7197,
      "valley": 0.3239,
      "deep": 0.1439,
      "purchase_agent": 0.4421,
      "line_loss": 0.0127,
      "system_cost": 0.0213,
      "transmission_distribution": 0.2144,
      "government_funds": 0.0292
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-10-dy-35up",
    "province": "浙江",
    "city": null,
    "month": "2025-10",
    "category": "单一制-工商业",
    "voltage_level": "35kV及以上",
    "prices": {
      "peak": 1.0235,
      "flat": 0.6823,
      "valley": 0.3071,
      "deep": 0.1365,
      "purchase_agent": 0.4421,
      "line_loss": 0.0127,
      "system_cost": 0.0213,
      "transmission_distribution": 0.177,
      "government_funds": 0.0292
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-11-dl-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2025-11",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 1.122556,
      "flat": 0.680337,
      "valley": 0.306152,
      "purchase_agent": 0.418324,
      "line_loss": 0.012919,
      "system_cost": 0.093855,
      "transmission_distribution": 0.126,
      "government_funds": 0.029239,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-11-dl-35k",
    "province": "浙江",
    "city": null,
    "month": "2025-11",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 1.072231,
      "flat": 0.649837,
      "valley": 0.292427,
      "purchase_agent": 0.418324,
      "line_loss": 0.012919,
      "system_cost": 0.093855,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029239,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-11-dl-110k",
    "province": "浙江",
    "city": null,
    "month": "2025-11",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 1.045171,
      "flat": 0.633437,
      "valley": 0.285047,
      "purchase_agent": 0.418324,
      "line_loss": 0.012919,
      "system_cost": 0.093855,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029239,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-11-dl-220up",
    "province": "浙江",
    "city": null,
    "month": "2025-11",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 1.028176,
      "flat": 0.623137,
      "valley": 0.280412,
      "purchase_agent": 0.418324,
      "line_loss": 0.012919,
      "system_cost": 0.093855,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029239,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-11-gs-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2025-11",
    "category": "两部制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 1.020505,
      "flat": 0.680337,
      "valley": 0.306152,
      "purchase_agent": 0.418324,
      "line_loss": 0.012919,
      "system_cost": 0.093855,
      "transmission_distribution": 0.126,
      "government_funds": 0.029239,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-11-gs-35k",
    "province": "浙江",
    "city": null,
    "month": "2025-11",
    "category": "两部制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.974755,
      "flat": 0.649837,
      "valley": 0.292427,
      "purchase_agent": 0.418324,
      "line_loss": 0.012919,
      "system_cost": 0.093855,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029239,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-11-gs-110k",
    "province": "浙江",
    "city": null,
    "month": "2025-11",
    "category": "两部制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.950155,
      "flat": 0.633437,
      "valley": 0.285047,
      "purchase_agent": 0.418324,
      "line_loss": 0.012919,
      "system_cost": 0.093855,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029239,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-11-gs-220up",
    "province": "浙江",
    "city": null,
    "month": "2025-11",
    "category": "两部制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.934705,
      "flat": 0.623137,
      "valley": 0.280412,
      "purchase_agent": 0.418324,
      "line_loss": 0.012919,
      "system_cost": 0.093855,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029239,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-11-dy-lt1k",
    "province": "浙江",
    "city": null,
    "month": "2025-11",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "peak": 1.187659,
      "flat": 0.791773,
      "valley": 0.356298,
      "purchase_agent": 0.418324,
      "line_loss": 0.012919,
      "system_cost": 0.086091,
      "transmission_distribution": 0.2452,
      "government_funds": 0.029239
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-11-dy-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2025-11",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 1.153105,
      "flat": 0.768737,
      "valley": 0.345932,
      "purchase_agent": 0.418324,
      "line_loss": 0.012919,
      "system_cost": 0.093855,
      "transmission_distribution": 0.2144,
      "government_funds": 0.029239
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-11-dy-35up",
    "province": "浙江",
    "city": null,
    "month": "2025-11",
    "category": "单一制-工商业",
    "voltage_level": "35kV及以上",
    "prices": {
      "peak": 1.097005,
      "flat": 0.731337,
      "valley": 0.329102,
      "purchase_agent": 0.418324,
      "line_loss": 0.012919,
      "system_cost": 0.093855,
      "transmission_distribution": 0.177,
      "government_funds": 0.029239
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-12-dl-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2025-12",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.316222,
      "peak": 1.096852,
      "flat": 0.664759,
      "valley": 0.252608,
      "purchase_agent": 0.442766,
      "line_loss": 0.014393,
      "system_cost": 0.052361,
      "transmission_distribution": 0.126,
      "government_funds": 0.029238,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-12-dl-35k",
    "province": "浙江",
    "city": null,
    "month": "2025-12",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 1.255832,
      "peak": 1.046527,
      "flat": 0.634259,
      "valley": 0.241018,
      "purchase_agent": 0.442766,
      "line_loss": 0.014393,
      "system_cost": 0.052361,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029238,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-12-dl-110k",
    "province": "浙江",
    "city": null,
    "month": "2025-12",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 1.22336,
      "peak": 1.019467,
      "flat": 0.617859,
      "valley": 0.234786,
      "purchase_agent": 0.442766,
      "line_loss": 0.014393,
      "system_cost": 0.052361,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029238,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-12-dl-220up",
    "province": "浙江",
    "city": null,
    "month": "2025-12",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 1.202966,
      "peak": 1.002472,
      "flat": 0.607559,
      "valley": 0.230872,
      "purchase_agent": 0.442766,
      "line_loss": 0.014393,
      "system_cost": 0.052361,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029238,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-12-gs-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2025-12",
    "category": "两部制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.096852,
      "peak": 0.997138,
      "flat": 0.664759,
      "valley": 0.252608,
      "purchase_agent": 0.442766,
      "line_loss": 0.014393,
      "system_cost": 0.052361,
      "transmission_distribution": 0.126,
      "government_funds": 0.029238,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-12-gs-35k",
    "province": "浙江",
    "city": null,
    "month": "2025-12",
    "category": "两部制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 1.046527,
      "peak": 0.951388,
      "flat": 0.634259,
      "valley": 0.241018,
      "purchase_agent": 0.442766,
      "line_loss": 0.014393,
      "system_cost": 0.052361,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029238,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-12-gs-110k",
    "province": "浙江",
    "city": null,
    "month": "2025-12",
    "category": "两部制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 1.019467,
      "peak": 0.926788,
      "flat": 0.617859,
      "valley": 0.234786,
      "purchase_agent": 0.442766,
      "line_loss": 0.014393,
      "system_cost": 0.052361,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029238,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-12-gs-220up",
    "province": "浙江",
    "city": null,
    "month": "2025-12",
    "category": "两部制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 1.002472,
      "peak": 0.911338,
      "flat": 0.607559,
      "valley": 0.230872,
      "purchase_agent": 0.442766,
      "line_loss": 0.014393,
      "system_cost": 0.052361,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029238,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-12-dy-lt1k",
    "province": "浙江",
    "city": null,
    "month": "2025-12",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "tip": 1.279396,
      "peak": 1.163088,
      "flat": 0.775392,
      "valley": 0.294649,
      "purchase_agent": 0.442766,
      "line_loss": 0.014393,
      "system_cost": 0.043794,
      "transmission_distribution": 0.2452,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-12-dy-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2025-12",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.242712,
      "peak": 1.129738,
      "flat": 0.753159,
      "valley": 0.2862,
      "purchase_agent": 0.442766,
      "line_loss": 0.014393,
      "system_cost": 0.052361,
      "transmission_distribution": 0.2144,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2025-12-dy-35up",
    "province": "浙江",
    "city": null,
    "month": "2025-12",
    "category": "单一制-工商业",
    "voltage_level": "35kV及以上",
    "prices": {
      "tip": 1.181002,
      "peak": 1.073638,
      "flat": 0.715759,
      "valley": 0.271988,
      "purchase_agent": 0.442766,
      "line_loss": 0.014393,
      "system_cost": 0.052361,
      "transmission_distribution": 0.177,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-01-dl-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-01",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.225037,
      "peak": 1.020864,
      "flat": 0.618706,
      "valley": 0.235108,
      "purchase_agent": 0.408586,
      "line_loss": 0.013871,
      "system_cost": 0.04101,
      "transmission_distribution": 0.126,
      "government_funds": 0.029238,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-01-dl-35k",
    "province": "浙江",
    "city": null,
    "month": "2026-01",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 1.164647,
      "peak": 0.970539,
      "flat": 0.588206,
      "valley": 0.223518,
      "purchase_agent": 0.408586,
      "line_loss": 0.013871,
      "system_cost": 0.04101,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029238,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-01-dl-110k",
    "province": "浙江",
    "city": null,
    "month": "2026-01",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 1.132175,
      "peak": 0.943479,
      "flat": 0.571806,
      "valley": 0.217286,
      "purchase_agent": 0.408586,
      "line_loss": 0.013871,
      "system_cost": 0.04101,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029238,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-01-dl-220up",
    "province": "浙江",
    "city": null,
    "month": "2026-01",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 1.111781,
      "peak": 0.926484,
      "flat": 0.561506,
      "valley": 0.213372,
      "purchase_agent": 0.408586,
      "line_loss": 0.013871,
      "system_cost": 0.04101,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029238,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-01-gs-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-01",
    "category": "两部制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.020864,
      "peak": 0.928059,
      "flat": 0.618706,
      "valley": 0.235108,
      "purchase_agent": 0.408586,
      "line_loss": 0.013871,
      "system_cost": 0.04101,
      "transmission_distribution": 0.126,
      "government_funds": 0.029238,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-01-gs-35k",
    "province": "浙江",
    "city": null,
    "month": "2026-01",
    "category": "两部制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 0.970539,
      "peak": 0.882309,
      "flat": 0.588206,
      "valley": 0.223518,
      "purchase_agent": 0.408586,
      "line_loss": 0.013871,
      "system_cost": 0.04101,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029238,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-01-gs-110k",
    "province": "浙江",
    "city": null,
    "month": "2026-01",
    "category": "两部制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 0.943479,
      "peak": 0.857709,
      "flat": 0.571806,
      "valley": 0.217286,
      "purchase_agent": 0.408586,
      "line_loss": 0.013871,
      "system_cost": 0.04101,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029238,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-01-gs-220up",
    "province": "浙江",
    "city": null,
    "month": "2026-01",
    "category": "两部制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 0.926484,
      "peak": 0.842259,
      "flat": 0.561506,
      "valley": 0.213372,
      "purchase_agent": 0.408586,
      "line_loss": 0.013871,
      "system_cost": 0.04101,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029238,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-01-dy-lt1k",
    "province": "浙江",
    "city": null,
    "month": "2026-01",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "tip": 1.202261,
      "peak": 1.092964,
      "flat": 0.728643,
      "valley": 0.276884,
      "purchase_agent": 0.408586,
      "line_loss": 0.013871,
      "system_cost": 0.031747,
      "transmission_distribution": 0.2452,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-01-dy-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-01",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.166724,
      "peak": 1.060659,
      "flat": 0.707106,
      "valley": 0.2687,
      "purchase_agent": 0.408586,
      "line_loss": 0.013871,
      "system_cost": 0.04101,
      "transmission_distribution": 0.2144,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-01-dy-35up",
    "province": "浙江",
    "city": null,
    "month": "2026-01",
    "category": "单一制-工商业",
    "voltage_level": "35kV及以上",
    "prices": {
      "tip": 1.105014,
      "peak": 1.004559,
      "flat": 0.669706,
      "valley": 0.254488,
      "purchase_agent": 0.408586,
      "line_loss": 0.013871,
      "system_cost": 0.04101,
      "transmission_distribution": 0.177,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "9:00",
        "type": "peak"
      },
      {
        "start": "9:00",
        "end": "11:00",
        "type": "tip"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "tip"
      },
      {
        "start": "17:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-02-dl-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-02",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 1.00164,
      "flat": 0.607055,
      "valley": 0.273175,
      "deep": 0.121411,
      "purchase_agent": 0.386655,
      "line_loss": 0.007591,
      "system_cost": 0.05757,
      "transmission_distribution": 0.126,
      "government_funds": 0.029238,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-02-dl-35k",
    "province": "浙江",
    "city": null,
    "month": "2026-02",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.951315,
      "flat": 0.576555,
      "valley": 0.25945,
      "deep": 0.115311,
      "purchase_agent": 0.386655,
      "line_loss": 0.007591,
      "system_cost": 0.05757,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029238,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-02-dl-110k",
    "province": "浙江",
    "city": null,
    "month": "2026-02",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.924255,
      "flat": 0.560155,
      "valley": 0.25207,
      "deep": 0.112031,
      "purchase_agent": 0.386655,
      "line_loss": 0.007591,
      "system_cost": 0.05757,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029238,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-02-dl-220up",
    "province": "浙江",
    "city": null,
    "month": "2026-02",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.90726,
      "flat": 0.549855,
      "valley": 0.247435,
      "deep": 0.109971,
      "purchase_agent": 0.386655,
      "line_loss": 0.007591,
      "system_cost": 0.05757,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029238,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-02-gs-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-02",
    "category": "两部制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.910582,
      "flat": 0.607055,
      "valley": 0.273175,
      "deep": 0.121411,
      "purchase_agent": 0.386655,
      "line_loss": 0.007591,
      "system_cost": 0.05757,
      "transmission_distribution": 0.126,
      "government_funds": 0.029238,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-02-gs-35k",
    "province": "浙江",
    "city": null,
    "month": "2026-02",
    "category": "两部制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.864832,
      "flat": 0.576555,
      "valley": 0.25945,
      "deep": 0.115311,
      "purchase_agent": 0.386655,
      "line_loss": 0.007591,
      "system_cost": 0.05757,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029238,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-02-gs-110k",
    "province": "浙江",
    "city": null,
    "month": "2026-02",
    "category": "两部制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.840232,
      "flat": 0.560155,
      "valley": 0.25207,
      "deep": 0.112031,
      "purchase_agent": 0.386655,
      "line_loss": 0.007591,
      "system_cost": 0.05757,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029238,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-02-gs-220up",
    "province": "浙江",
    "city": null,
    "month": "2026-02",
    "category": "两部制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.824782,
      "flat": 0.549855,
      "valley": 0.247435,
      "deep": 0.109971,
      "purchase_agent": 0.386655,
      "line_loss": 0.007591,
      "system_cost": 0.05757,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029238,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-02-dy-lt1k",
    "province": "浙江",
    "city": null,
    "month": "2026-02",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "peak": 1.059984,
      "flat": 0.706656,
      "valley": 0.317995,
      "deep": 0.141331,
      "purchase_agent": 0.386655,
      "line_loss": 0.007591,
      "system_cost": 0.037971,
      "transmission_distribution": 0.2452,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-02-dy-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-02",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 1.043182,
      "flat": 0.695455,
      "valley": 0.312955,
      "deep": 0.139091,
      "purchase_agent": 0.386655,
      "line_loss": 0.007591,
      "system_cost": 0.05757,
      "transmission_distribution": 0.2144,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-02-dy-35up",
    "province": "浙江",
    "city": null,
    "month": "2026-02",
    "category": "单一制-工商业",
    "voltage_level": "35kV及以上",
    "prices": {
      "peak": 0.987082,
      "flat": 0.658055,
      "valley": 0.296125,
      "deep": 0.131611,
      "purchase_agent": 0.386655,
      "line_loss": 0.007591,
      "system_cost": 0.05757,
      "transmission_distribution": 0.177,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-03-dl-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-03",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.97904,
      "flat": 0.593358,
      "valley": 0.267011,
      "purchase_agent": 0.371954,
      "line_loss": 0.011512,
      "system_cost": 0.054653,
      "transmission_distribution": 0.126,
      "government_funds": 0.029238,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-03-dl-35k",
    "province": "浙江",
    "city": null,
    "month": "2026-03",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.928715,
      "flat": 0.562858,
      "valley": 0.253286,
      "purchase_agent": 0.371954,
      "line_loss": 0.011512,
      "system_cost": 0.054653,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029238,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-03-dl-110k",
    "province": "浙江",
    "city": null,
    "month": "2026-03",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.901655,
      "flat": 0.546458,
      "valley": 0.245906,
      "purchase_agent": 0.371954,
      "line_loss": 0.011512,
      "system_cost": 0.054653,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029238,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-03-dl-220up",
    "province": "浙江",
    "city": null,
    "month": "2026-03",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.88466,
      "flat": 0.536158,
      "valley": 0.241271,
      "purchase_agent": 0.371954,
      "line_loss": 0.011512,
      "system_cost": 0.054653,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029238,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-03-gs-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-03",
    "category": "两部制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.890037,
      "flat": 0.593358,
      "valley": 0.267011,
      "purchase_agent": 0.371954,
      "line_loss": 0.011512,
      "system_cost": 0.054653,
      "transmission_distribution": 0.126,
      "government_funds": 0.029238,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-03-gs-35k",
    "province": "浙江",
    "city": null,
    "month": "2026-03",
    "category": "两部制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.844287,
      "flat": 0.562858,
      "valley": 0.253286,
      "purchase_agent": 0.371954,
      "line_loss": 0.011512,
      "system_cost": 0.054653,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029238,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-03-gs-110k",
    "province": "浙江",
    "city": null,
    "month": "2026-03",
    "category": "两部制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.819687,
      "flat": 0.546458,
      "valley": 0.245906,
      "purchase_agent": 0.371954,
      "line_loss": 0.011512,
      "system_cost": 0.054653,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029238,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-03-gs-220up",
    "province": "浙江",
    "city": null,
    "month": "2026-03",
    "category": "两部制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.804237,
      "flat": 0.536158,
      "valley": 0.241271,
      "purchase_agent": 0.371954,
      "line_loss": 0.011512,
      "system_cost": 0.054653,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029238,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-03-dy-lt1k",
    "province": "浙江",
    "city": null,
    "month": "2026-03",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "peak": 1.054884,
      "flat": 0.703256,
      "valley": 0.316465,
      "purchase_agent": 0.371954,
      "line_loss": 0.011512,
      "system_cost": 0.045351,
      "transmission_distribution": 0.2452,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-03-dy-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-03",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 1.022637,
      "flat": 0.681758,
      "valley": 0.306791,
      "purchase_agent": 0.371954,
      "line_loss": 0.011512,
      "system_cost": 0.054653,
      "transmission_distribution": 0.2144,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-03-dy-35up",
    "province": "浙江",
    "city": null,
    "month": "2026-03",
    "category": "单一制-工商业",
    "voltage_level": "35kV及以上",
    "prices": {
      "peak": 0.966537,
      "flat": 0.644358,
      "valley": 0.289961,
      "purchase_agent": 0.371954,
      "line_loss": 0.011512,
      "system_cost": 0.054653,
      "transmission_distribution": 0.177,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-04-dl-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-04",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 1.011327,
      "flat": 0.612926,
      "valley": 0.275817,
      "purchase_agent": 0.352658,
      "line_loss": 0.014048,
      "system_cost": 0.090981,
      "transmission_distribution": 0.126,
      "government_funds": 0.029238,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-04-dl-35k",
    "province": "浙江",
    "city": null,
    "month": "2026-04",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.961002,
      "flat": 0.582426,
      "valley": 0.262092,
      "purchase_agent": 0.352658,
      "line_loss": 0.014048,
      "system_cost": 0.090981,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029238,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-04-dl-110k",
    "province": "浙江",
    "city": null,
    "month": "2026-04",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.933942,
      "flat": 0.566026,
      "valley": 0.254712,
      "purchase_agent": 0.352658,
      "line_loss": 0.014048,
      "system_cost": 0.090981,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029238,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-04-dl-220up",
    "province": "浙江",
    "city": null,
    "month": "2026-04",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.916947,
      "flat": 0.555726,
      "valley": 0.250077,
      "purchase_agent": 0.352658,
      "line_loss": 0.014048,
      "system_cost": 0.090981,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029238,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-04-gs-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-04",
    "category": "两部制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.919389,
      "flat": 0.612926,
      "valley": 0.275817,
      "purchase_agent": 0.352658,
      "line_loss": 0.014048,
      "system_cost": 0.090981,
      "transmission_distribution": 0.126,
      "government_funds": 0.029238,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-04-gs-35k",
    "province": "浙江",
    "city": null,
    "month": "2026-04",
    "category": "两部制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.873639,
      "flat": 0.582426,
      "valley": 0.262092,
      "purchase_agent": 0.352658,
      "line_loss": 0.014048,
      "system_cost": 0.090981,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029238,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-04-gs-110k",
    "province": "浙江",
    "city": null,
    "month": "2026-04",
    "category": "两部制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.849039,
      "flat": 0.566026,
      "valley": 0.254712,
      "purchase_agent": 0.352658,
      "line_loss": 0.014048,
      "system_cost": 0.090981,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029238,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-04-gs-220up",
    "province": "浙江",
    "city": null,
    "month": "2026-04",
    "category": "两部制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.833589,
      "flat": 0.555726,
      "valley": 0.250077,
      "purchase_agent": 0.352658,
      "line_loss": 0.014048,
      "system_cost": 0.090981,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029238,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-04-dy-lt1k",
    "province": "浙江",
    "city": null,
    "month": "2026-04",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "peak": 1.082608,
      "flat": 0.721739,
      "valley": 0.324782,
      "purchase_agent": 0.352658,
      "line_loss": 0.014048,
      "system_cost": 0.080594,
      "transmission_distribution": 0.2452,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-04-dy-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-04",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 1.051989,
      "flat": 0.701326,
      "valley": 0.315597,
      "purchase_agent": 0.352658,
      "line_loss": 0.014048,
      "system_cost": 0.090981,
      "transmission_distribution": 0.2144,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-04-dy-35up",
    "province": "浙江",
    "city": null,
    "month": "2026-04",
    "category": "单一制-工商业",
    "voltage_level": "35kV及以上",
    "prices": {
      "peak": 0.995889,
      "flat": 0.663926,
      "valley": 0.298767,
      "purchase_agent": 0.352658,
      "line_loss": 0.014048,
      "system_cost": 0.090981,
      "transmission_distribution": 0.177,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-05-dl-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-05",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.995846,
      "flat": 0.603543,
      "valley": 0.271594,
      "deep": 0.120709,
      "purchase_agent": 0.371867,
      "line_loss": 0.011174,
      "system_cost": 0.065263,
      "transmission_distribution": 0.126,
      "government_funds": 0.029238,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-05-dl-35k",
    "province": "浙江",
    "city": null,
    "month": "2026-05",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.945521,
      "flat": 0.573043,
      "valley": 0.257869,
      "deep": 0.114609,
      "purchase_agent": 0.371867,
      "line_loss": 0.011174,
      "system_cost": 0.065263,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029238,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-05-dl-110k",
    "province": "浙江",
    "city": null,
    "month": "2026-05",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.918461,
      "flat": 0.556643,
      "valley": 0.250489,
      "deep": 0.111329,
      "purchase_agent": 0.371867,
      "line_loss": 0.011174,
      "system_cost": 0.065263,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029238,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-05-dl-220up",
    "province": "浙江",
    "city": null,
    "month": "2026-05",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.901466,
      "flat": 0.546343,
      "valley": 0.245854,
      "deep": 0.109269,
      "purchase_agent": 0.371867,
      "line_loss": 0.011174,
      "system_cost": 0.065263,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029238,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-05-gs-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-05",
    "category": "两部制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.905314,
      "flat": 0.603543,
      "valley": 0.271594,
      "deep": 0.120709,
      "purchase_agent": 0.371867,
      "line_loss": 0.011174,
      "system_cost": 0.065263,
      "transmission_distribution": 0.126,
      "government_funds": 0.029238,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-05-gs-35k",
    "province": "浙江",
    "city": null,
    "month": "2026-05",
    "category": "两部制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.859564,
      "flat": 0.573043,
      "valley": 0.257869,
      "deep": 0.114609,
      "purchase_agent": 0.371867,
      "line_loss": 0.011174,
      "system_cost": 0.065263,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029238,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-05-gs-110k",
    "province": "浙江",
    "city": null,
    "month": "2026-05",
    "category": "两部制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.834964,
      "flat": 0.556643,
      "valley": 0.250489,
      "deep": 0.111329,
      "purchase_agent": 0.371867,
      "line_loss": 0.011174,
      "system_cost": 0.065263,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029238,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-05-gs-220up",
    "province": "浙江",
    "city": null,
    "month": "2026-05",
    "category": "两部制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.819514,
      "flat": 0.546343,
      "valley": 0.245854,
      "deep": 0.109269,
      "purchase_agent": 0.371867,
      "line_loss": 0.011174,
      "system_cost": 0.065263,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029238,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-05-dy-lt1k",
    "province": "浙江",
    "city": null,
    "month": "2026-05",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "peak": 1.070037,
      "flat": 0.713358,
      "valley": 0.321011,
      "deep": 0.142672,
      "purchase_agent": 0.371867,
      "line_loss": 0.011174,
      "system_cost": 0.055878,
      "transmission_distribution": 0.2452,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-05-dy-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-05",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 1.037914,
      "flat": 0.691943,
      "valley": 0.311374,
      "deep": 0.138389,
      "purchase_agent": 0.371867,
      "line_loss": 0.011174,
      "system_cost": 0.065263,
      "transmission_distribution": 0.2144,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-05-dy-35up",
    "province": "浙江",
    "city": null,
    "month": "2026-05",
    "category": "单一制-工商业",
    "voltage_level": "35kV及以上",
    "prices": {
      "peak": 0.981814,
      "flat": 0.654543,
      "valley": 0.294544,
      "deep": 0.130909,
      "purchase_agent": 0.371867,
      "line_loss": 0.011174,
      "system_cost": 0.065263,
      "transmission_distribution": 0.177,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-06-dl-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-06",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.988147,
      "flat": 0.598877,
      "valley": 0.269495,
      "purchase_agent": 0.391006,
      "line_loss": 0.0112,
      "system_cost": 0.041432,
      "transmission_distribution": 0.126,
      "government_funds": 0.029238,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-06-dl-35k",
    "province": "浙江",
    "city": null,
    "month": "2026-06",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.937822,
      "flat": 0.568377,
      "valley": 0.25577,
      "purchase_agent": 0.391006,
      "line_loss": 0.0112,
      "system_cost": 0.041432,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029238,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-06-dl-110k",
    "province": "浙江",
    "city": null,
    "month": "2026-06",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.910762,
      "flat": 0.551977,
      "valley": 0.24839,
      "purchase_agent": 0.391006,
      "line_loss": 0.0112,
      "system_cost": 0.041432,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029238,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-06-dl-220up",
    "province": "浙江",
    "city": null,
    "month": "2026-06",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.893767,
      "flat": 0.541677,
      "valley": 0.243755,
      "purchase_agent": 0.391006,
      "line_loss": 0.0112,
      "system_cost": 0.041432,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029238,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-06-gs-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-06",
    "category": "两部制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.898315,
      "flat": 0.598877,
      "valley": 0.269495,
      "purchase_agent": 0.391006,
      "line_loss": 0.0112,
      "system_cost": 0.041432,
      "transmission_distribution": 0.126,
      "government_funds": 0.029238,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-06-gs-35k",
    "province": "浙江",
    "city": null,
    "month": "2026-06",
    "category": "两部制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.852565,
      "flat": 0.568377,
      "valley": 0.25577,
      "purchase_agent": 0.391006,
      "line_loss": 0.0112,
      "system_cost": 0.041432,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029238,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-06-gs-110k",
    "province": "浙江",
    "city": null,
    "month": "2026-06",
    "category": "两部制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.827965,
      "flat": 0.551977,
      "valley": 0.24839,
      "purchase_agent": 0.391006,
      "line_loss": 0.0112,
      "system_cost": 0.041432,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029238,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-06-gs-220up",
    "province": "浙江",
    "city": null,
    "month": "2026-06",
    "category": "两部制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.812515,
      "flat": 0.541677,
      "valley": 0.243755,
      "purchase_agent": 0.391006,
      "line_loss": 0.0112,
      "system_cost": 0.041432,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029238,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-06-dy-lt1k",
    "province": "浙江",
    "city": null,
    "month": "2026-06",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "peak": 1.062388,
      "flat": 0.708259,
      "valley": 0.318716,
      "purchase_agent": 0.391006,
      "line_loss": 0.0112,
      "system_cost": 0.031614,
      "transmission_distribution": 0.2452,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-06-dy-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-06",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 1.030915,
      "flat": 0.687277,
      "valley": 0.309275,
      "purchase_agent": 0.391006,
      "line_loss": 0.0112,
      "system_cost": 0.041432,
      "transmission_distribution": 0.2144,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-06-dy-35up",
    "province": "浙江",
    "city": null,
    "month": "2026-06",
    "category": "单一制-工商业",
    "voltage_level": "35kV及以上",
    "prices": {
      "peak": 0.974815,
      "flat": 0.649877,
      "valley": 0.292445,
      "purchase_agent": 0.391006,
      "line_loss": 0.0112,
      "system_cost": 0.041432,
      "transmission_distribution": 0.177,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "8:00",
        "type": "valley"
      },
      {
        "start": "8:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "13:00",
        "type": "valley"
      },
      {
        "start": "13:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-07-dl-lt1k",
    "province": "浙江",
    "city": null,
    "month": "2026-07",
    "category": "两部制-大工业",
    "voltage_level": "不满1kV",
    "prices": {
      "tip": 1.112728,
      "peak": 1.019315,
      "flat": 0.622307,
      "valley": 0.342066,
      "purchase_agent": 0.421346,
      "line_loss": 0.012292,
      "system_cost": 0.03343,
      "transmission_distribution": 0.126,
      "government_funds": 0.029238,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "7:00",
        "type": "valley"
      },
      {
        "start": "7:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-07-dl-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-07",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.132687,
      "peak": 1.037326,
      "flat": 0.632043,
      "valley": 0.34596,
      "purchase_agent": 0.421346,
      "line_loss": 0.012292,
      "system_cost": 0.043166,
      "transmission_distribution": 0.126,
      "government_funds": 0.029238,
      "demand_charge": 48.0,
      "capacity_charge": 30.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "7:00",
        "type": "valley"
      },
      {
        "start": "7:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-07-dl-35k",
    "province": "浙江",
    "city": null,
    "month": "2026-07",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 1.102187,
      "peak": 1.006826,
      "flat": 0.601543,
      "valley": 0.31546,
      "purchase_agent": 0.421346,
      "line_loss": 0.012292,
      "system_cost": 0.043166,
      "transmission_distribution": 0.0955,
      "government_funds": 0.029238,
      "demand_charge": 44.8,
      "capacity_charge": 28.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "7:00",
        "type": "valley"
      },
      {
        "start": "7:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-07-dl-110k",
    "province": "浙江",
    "city": null,
    "month": "2026-07",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 1.085787,
      "peak": 0.990426,
      "flat": 0.585143,
      "valley": 0.29906,
      "purchase_agent": 0.421346,
      "line_loss": 0.012292,
      "system_cost": 0.043166,
      "transmission_distribution": 0.0791,
      "government_funds": 0.029238,
      "demand_charge": 41.6,
      "capacity_charge": 26.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "7:00",
        "type": "valley"
      },
      {
        "start": "7:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-07-dl-220up",
    "province": "浙江",
    "city": null,
    "month": "2026-07",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 1.075487,
      "peak": 0.980126,
      "flat": 0.574843,
      "valley": 0.28876,
      "purchase_agent": 0.421346,
      "line_loss": 0.012292,
      "system_cost": 0.043166,
      "transmission_distribution": 0.0688,
      "government_funds": 0.029238,
      "demand_charge": 38.3,
      "capacity_charge": 24.0
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "7:00",
        "type": "valley"
      },
      {
        "start": "7:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-07-dy-lt1k",
    "province": "浙江",
    "city": null,
    "month": "2026-07",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "tip": 1.231928,
      "peak": 1.138515,
      "flat": 0.741507,
      "valley": 0.461266,
      "purchase_agent": 0.421346,
      "line_loss": 0.012292,
      "system_cost": 0.03343,
      "transmission_distribution": 0.2452,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "7:00",
        "type": "valley"
      },
      {
        "start": "7:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-07-dy-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-07",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.221087,
      "peak": 1.125726,
      "flat": 0.720443,
      "valley": 0.43436,
      "purchase_agent": 0.421346,
      "line_loss": 0.012292,
      "system_cost": 0.043166,
      "transmission_distribution": 0.2144,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "7:00",
        "type": "valley"
      },
      {
        "start": "7:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-07-dy-35up",
    "province": "浙江",
    "city": null,
    "month": "2026-07",
    "category": "单一制-工商业",
    "voltage_level": "35kV及以上",
    "prices": {
      "tip": 1.183687,
      "peak": 1.088326,
      "flat": 0.683043,
      "valley": 0.39696,
      "purchase_agent": 0.421346,
      "line_loss": 0.012292,
      "system_cost": 0.043166,
      "transmission_distribution": 0.177,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "0:00",
        "end": "7:00",
        "type": "valley"
      },
      {
        "start": "7:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；重大节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-08-dl-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.129383,
      "peak": 1.034247,
      "flat": 0.629919,
      "valley": 0.344511,
      "purchase_agent": 0.41784,
      "line_loss": 0.009709,
      "system_cost": 0.048131,
      "transmission_distribution": 0.125,
      "government_funds": 0.029238,
      "demand_charge": 47.2,
      "capacity_charge": 29.5
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-08-dl-35k",
    "province": "浙江",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 1.093883,
      "peak": 0.998747,
      "flat": 0.594419,
      "valley": 0.309011,
      "purchase_agent": 0.41784,
      "line_loss": 0.009709,
      "system_cost": 0.048131,
      "transmission_distribution": 0.0895,
      "government_funds": 0.029238,
      "demand_charge": 44.0,
      "capacity_charge": 27.5
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-08-dl-110k",
    "province": "浙江",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 1.081083,
      "peak": 0.985947,
      "flat": 0.581619,
      "valley": 0.296211,
      "purchase_agent": 0.41784,
      "line_loss": 0.009709,
      "system_cost": 0.048131,
      "transmission_distribution": 0.0767,
      "government_funds": 0.029238,
      "demand_charge": 40.8,
      "capacity_charge": 25.5
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-08-dl-220up",
    "province": "浙江",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 1.070683,
      "peak": 0.975547,
      "flat": 0.571219,
      "valley": 0.285811,
      "purchase_agent": 0.41784,
      "line_loss": 0.009709,
      "system_cost": 0.048131,
      "transmission_distribution": 0.0663,
      "government_funds": 0.029238,
      "demand_charge": 37.6,
      "capacity_charge": 23.5
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-08-dy-lt1k",
    "province": "浙江",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "tip": 1.22774,
      "peak": 1.134344,
      "flat": 0.737415,
      "valley": 0.457229,
      "purchase_agent": 0.41784,
      "line_loss": 0.009709,
      "system_cost": 0.039427,
      "transmission_distribution": 0.2412,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-08-dy-1_10k",
    "province": "浙江",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.215783,
      "peak": 1.120647,
      "flat": 0.716319,
      "valley": 0.430911,
      "purchase_agent": 0.41784,
      "line_loss": 0.009709,
      "system_cost": 0.048131,
      "transmission_distribution": 0.2114,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-08-dy-35k",
    "province": "浙江",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 1.174383,
      "peak": 1.079247,
      "flat": 0.674919,
      "valley": 0.389511,
      "purchase_agent": 0.41784,
      "line_loss": 0.009709,
      "system_cost": 0.048131,
      "transmission_distribution": 0.17,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-08-dy-110k",
    "province": "浙江",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 1.154383,
      "peak": 1.059247,
      "flat": 0.654919,
      "valley": 0.369511,
      "purchase_agent": 0.41784,
      "line_loss": 0.009709,
      "system_cost": 0.048131,
      "transmission_distribution": 0.15,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "zj-2026-08-dy-220up",
    "province": "浙江",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 1.139383,
      "peak": 1.044247,
      "flat": 0.639919,
      "valley": 0.354511,
      "purchase_agent": 0.41784,
      "line_loss": 0.009709,
      "system_cost": 0.048131,
      "transmission_distribution": 0.135,
      "government_funds": 0.029238
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "18:00",
        "type": "peak"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网浙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "浙发改价格〔2026〕112号",
    "float_rules": {
      "tip": 2.05,
      "peak": 1.85,
      "flat": 1.0,
      "valley": 0.4,
      "deep": 0.2,
      "base_type": "agency_loss_system",
      "formula_note": "分时电价=(代购电价+线损+系统费)×浮动比例+输配+基金",
      "special_period_note": "夏冬季(1/7/8/12月)执行尖峰18:00-22:00；节假日执行深谷"
    },
    "_deleted": false
  },
  {
    "id": "fj-2026-08-dy-lt1k",
    "province": "福建",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "tip": 0.95608855,
      "flat": 0.65517175,
      "purchase_agent": 0.376146,
      "line_loss": 0.013104,
      "system_cost": 0.054953,
      "transmission_distribution": 0.1833,
      "government_funds": 0.02766875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "12:00",
        "type": "tip"
      },
      {
        "start": "12:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "tip"
      },
      {
        "start": "18:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "21:00",
        "type": "flat"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网福建95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "闽发改规〔2023〕8号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.58,
      "flat": 1.0,
      "valley": 0.37,
      "base_type": "agency_only",
      "formula_note": "尖峰=代购×1.8+线损+输配+基金+系统费; 峰=代购×1.58+...; 谷=代购×(1-63%)+...",
      "special_period_note": "7-9月执行尖峰时段 11:00-12:00、17:00-18:00"
    },
    "_deleted": false
  },
  {
    "id": "fj-2026-08-dy-1_10k",
    "province": "福建",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 0.93608855,
      "flat": 0.63517175,
      "purchase_agent": 0.376146,
      "line_loss": 0.013104,
      "system_cost": 0.054953,
      "transmission_distribution": 0.1633,
      "government_funds": 0.02766875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "12:00",
        "type": "tip"
      },
      {
        "start": "12:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "tip"
      },
      {
        "start": "18:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "21:00",
        "type": "flat"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网福建95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "闽发改规〔2023〕8号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.58,
      "flat": 1.0,
      "valley": 0.37,
      "base_type": "agency_only",
      "formula_note": "尖峰=代购×1.8+线损+输配+基金+系统费; 峰=代购×1.58+...; 谷=代购×(1-63%)+...",
      "special_period_note": "7-9月执行尖峰时段 11:00-12:00、17:00-18:00"
    },
    "_deleted": false
  },
  {
    "id": "fj-2026-08-dy-35k",
    "province": "福建",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 0.91608855,
      "flat": 0.61517175,
      "purchase_agent": 0.376146,
      "line_loss": 0.013104,
      "system_cost": 0.054953,
      "transmission_distribution": 0.1433,
      "government_funds": 0.02766875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "12:00",
        "type": "tip"
      },
      {
        "start": "12:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "tip"
      },
      {
        "start": "18:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "21:00",
        "type": "flat"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网福建95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "闽发改规〔2023〕8号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.58,
      "flat": 1.0,
      "valley": 0.37,
      "base_type": "agency_only",
      "formula_note": "尖峰=代购×1.8+线损+输配+基金+系统费; 峰=代购×1.58+...; 谷=代购×(1-63%)+...",
      "special_period_note": "7-9月执行尖峰时段 11:00-12:00、17:00-18:00"
    },
    "_deleted": false
  },
  {
    "id": "fj-2026-08-dy-110k",
    "province": "福建",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 0.89608855,
      "flat": 0.59517175,
      "purchase_agent": 0.376146,
      "line_loss": 0.013104,
      "system_cost": 0.054953,
      "transmission_distribution": 0.1233,
      "government_funds": 0.02766875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "12:00",
        "type": "tip"
      },
      {
        "start": "12:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "tip"
      },
      {
        "start": "18:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "21:00",
        "type": "flat"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网福建95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "闽发改规〔2023〕8号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.58,
      "flat": 1.0,
      "valley": 0.37,
      "base_type": "agency_only",
      "formula_note": "尖峰=代购×1.8+线损+输配+基金+系统费; 峰=代购×1.58+...; 谷=代购×(1-63%)+...",
      "special_period_note": "7-9月执行尖峰时段 11:00-12:00、17:00-18:00"
    },
    "_deleted": false
  },
  {
    "id": "fj-2026-08-dy-220up",
    "province": "福建",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 0.86108855,
      "flat": 0.56017175,
      "purchase_agent": 0.376146,
      "line_loss": 0.013104,
      "system_cost": 0.054953,
      "transmission_distribution": 0.0883,
      "government_funds": 0.02766875
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "12:00",
        "type": "tip"
      },
      {
        "start": "12:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "tip"
      },
      {
        "start": "18:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "21:00",
        "type": "flat"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网福建95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "闽发改规〔2023〕8号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.58,
      "flat": 1.0,
      "valley": 0.37,
      "base_type": "agency_only",
      "formula_note": "尖峰=代购×1.8+线损+输配+基金+系统费; 峰=代购×1.58+...; 谷=代购×(1-63%)+...",
      "special_period_note": "7-9月执行尖峰时段 11:00-12:00、17:00-18:00"
    },
    "_deleted": false
  },
  {
    "id": "fj-2026-08-dl-1_10k",
    "province": "福建",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 0.89468855,
      "flat": 0.59377175,
      "purchase_agent": 0.376146,
      "line_loss": 0.013104,
      "system_cost": 0.054953,
      "transmission_distribution": 0.1219,
      "government_funds": 0.02766875,
      "demand_charge": 40.0,
      "capacity_charge": 25.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "12:00",
        "type": "tip"
      },
      {
        "start": "12:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "tip"
      },
      {
        "start": "18:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "21:00",
        "type": "flat"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网福建95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "闽发改规〔2023〕8号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.58,
      "flat": 1.0,
      "valley": 0.37,
      "base_type": "agency_only",
      "formula_note": "尖峰=代购×1.8+线损+输配+基金+系统费; 峰=代购×1.58+...; 谷=代购×(1-63%)+...",
      "special_period_note": "7-9月执行尖峰时段 11:00-12:00、17:00-18:00"
    },
    "_deleted": false
  },
  {
    "id": "fj-2026-08-dl-35k",
    "province": "福建",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 0.87468855,
      "flat": 0.57377175,
      "purchase_agent": 0.376146,
      "line_loss": 0.013104,
      "system_cost": 0.054953,
      "transmission_distribution": 0.1019,
      "government_funds": 0.02766875,
      "demand_charge": 39.0,
      "capacity_charge": 24.4
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "12:00",
        "type": "tip"
      },
      {
        "start": "12:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "tip"
      },
      {
        "start": "18:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "21:00",
        "type": "flat"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网福建95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "闽发改规〔2023〕8号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.58,
      "flat": 1.0,
      "valley": 0.37,
      "base_type": "agency_only",
      "formula_note": "尖峰=代购×1.8+线损+输配+基金+系统费; 峰=代购×1.58+...; 谷=代购×(1-63%)+...",
      "special_period_note": "7-9月执行尖峰时段 11:00-12:00、17:00-18:00"
    },
    "_deleted": false
  },
  {
    "id": "fj-2026-08-dl-110k",
    "province": "福建",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 0.84968855,
      "flat": 0.54877175,
      "purchase_agent": 0.376146,
      "line_loss": 0.013104,
      "system_cost": 0.054953,
      "transmission_distribution": 0.0769,
      "government_funds": 0.02766875,
      "demand_charge": 38.0,
      "capacity_charge": 23.8
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "12:00",
        "type": "tip"
      },
      {
        "start": "12:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "tip"
      },
      {
        "start": "18:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "21:00",
        "type": "flat"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网福建95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "闽发改规〔2023〕8号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.58,
      "flat": 1.0,
      "valley": 0.37,
      "base_type": "agency_only",
      "formula_note": "尖峰=代购×1.8+线损+输配+基金+系统费; 峰=代购×1.58+...; 谷=代购×(1-63%)+...",
      "special_period_note": "7-9月执行尖峰时段 11:00-12:00、17:00-18:00"
    },
    "_deleted": false
  },
  {
    "id": "fj-2026-08-dl-220up",
    "province": "福建",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 0.81898855,
      "flat": 0.51807175,
      "purchase_agent": 0.376146,
      "line_loss": 0.013104,
      "system_cost": 0.054953,
      "transmission_distribution": 0.0462,
      "government_funds": 0.02766875,
      "demand_charge": 37.0,
      "capacity_charge": 23.1
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "10:00",
        "type": "flat"
      },
      {
        "start": "10:00",
        "end": "11:00",
        "type": "peak"
      },
      {
        "start": "11:00",
        "end": "12:00",
        "type": "tip"
      },
      {
        "start": "12:00",
        "end": "15:00",
        "type": "flat"
      },
      {
        "start": "15:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "tip"
      },
      {
        "start": "18:00",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "21:00",
        "type": "flat"
      },
      {
        "start": "21:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网福建95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "闽发改规〔2023〕8号",
    "float_rules": {
      "tip": 1.8,
      "peak": 1.58,
      "flat": 1.0,
      "valley": 0.37,
      "base_type": "agency_only",
      "formula_note": "尖峰=代购×1.8+线损+输配+基金+系统费; 峰=代购×1.58+...; 谷=代购×(1-63%)+...",
      "special_period_note": "7-9月执行尖峰时段 11:00-12:00、17:00-18:00"
    },
    "_deleted": false
  },
  {
    "id": "cq-2026-08-dy-lt1k",
    "province": "重庆",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "flat": 0.845413,
      "purchase_agent": 0.487445,
      "line_loss": 0.017274,
      "system_cost": 0.0578,
      "transmission_distribution": 0.2352,
      "government_funds": 0.047694
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "20:00",
        "type": "flat"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网重庆95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "渝发改价格〔2023〕1420号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.38,
      "base_type": "agency_only",
      "formula_note": "工业分时高峰上浮60%，低谷下浮62%，大工业夏季尖峰在高峰基础上上浮20%",
      "special_period_note": "夏季7、8月大工业执行尖峰 11:00-12:00、17:00-18:00（单一制一般工商业不执行尖峰）"
    },
    "_deleted": false
  },
  {
    "id": "cq-2026-08-dy-1_10k",
    "province": "重庆",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.47127,
      "peak": 1.24652,
      "flat": 0.825113,
      "valley": 0.389659,
      "purchase_agent": 0.487445,
      "line_loss": 0.017274,
      "system_cost": 0.0578,
      "transmission_distribution": 0.2149,
      "government_funds": 0.047694
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "20:00",
        "type": "flat"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网重庆95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "渝发改价格〔2023〕1420号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.38,
      "base_type": "agency_only",
      "formula_note": "工业分时高峰上浮60%，低谷下浮62%，大工业夏季尖峰在高峰基础上上浮20%",
      "special_period_note": "夏季7、8月大工业执行尖峰 11:00-12:00、17:00-18:00（单一制一般工商业不执行尖峰）"
    },
    "_deleted": false
  },
  {
    "id": "cq-2026-08-dy-35k",
    "province": "重庆",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 1.432678,
      "peak": 1.21436,
      "flat": 0.805013,
      "valley": 0.382021,
      "purchase_agent": 0.487445,
      "line_loss": 0.017274,
      "system_cost": 0.0578,
      "transmission_distribution": 0.1948,
      "government_funds": 0.047694
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "20:00",
        "type": "flat"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网重庆95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "渝发改价格〔2023〕1420号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.38,
      "base_type": "agency_only",
      "formula_note": "工业分时高峰上浮60%，低谷下浮62%，大工业夏季尖峰在高峰基础上上浮20%",
      "special_period_note": "夏季7、8月大工业执行尖峰 11:00-12:00、17:00-18:00（单一制一般工商业不执行尖峰）"
    },
    "_deleted": false
  },
  {
    "id": "cq-2026-08-dy-110k",
    "province": "重庆",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 1.403494,
      "peak": 1.19004,
      "flat": 0.789813,
      "valley": 0.376245,
      "purchase_agent": 0.487445,
      "line_loss": 0.017274,
      "system_cost": 0.0578,
      "transmission_distribution": 0.1796,
      "government_funds": 0.047694
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "20:00",
        "type": "flat"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网重庆95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "渝发改价格〔2023〕1420号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.38,
      "base_type": "agency_only",
      "formula_note": "工业分时高峰上浮60%，低谷下浮62%，大工业夏季尖峰在高峰基础上上浮20%",
      "special_period_note": "夏季7、8月大工业执行尖峰 11:00-12:00、17:00-18:00（单一制一般工商业不执行尖峰）"
    },
    "_deleted": false
  },
  {
    "id": "cq-2026-08-dy-220up",
    "province": "重庆",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 1.374886,
      "peak": 1.1662,
      "flat": 0.774913,
      "valley": 0.370583,
      "purchase_agent": 0.487445,
      "line_loss": 0.017274,
      "system_cost": 0.0578,
      "transmission_distribution": 0.1647,
      "government_funds": 0.047694
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "20:00",
        "type": "flat"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网重庆95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "渝发改价格〔2023〕1420号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.38,
      "base_type": "agency_only",
      "formula_note": "工业分时高峰上浮60%，低谷下浮62%，大工业夏季尖峰在高峰基础上上浮20%",
      "special_period_note": "夏季7、8月大工业执行尖峰 11:00-12:00、17:00-18:00（单一制一般工商业不执行尖峰）"
    },
    "_deleted": false
  },
  {
    "id": "cq-2026-08-dl-1_10k",
    "province": "重庆",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 1.349542,
      "peak": 1.14508,
      "flat": 0.761713,
      "valley": 0.365567,
      "purchase_agent": 0.487445,
      "line_loss": 0.017274,
      "system_cost": 0.0578,
      "transmission_distribution": 0.1515,
      "government_funds": 0.047694,
      "demand_charge": 35.2,
      "capacity_charge": 22.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "20:00",
        "type": "flat"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网重庆95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "渝发改价格〔2023〕1420号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.38,
      "base_type": "agency_only",
      "formula_note": "工业分时高峰上浮60%，低谷下浮62%，大工业夏季尖峰在高峰基础上上浮20%",
      "special_period_note": "夏季7、8月大工业执行尖峰 11:00-12:00、17:00-18:00（单一制一般工商业不执行尖峰）"
    },
    "_deleted": false
  },
  {
    "id": "cq-2026-08-dl-35k",
    "province": "重庆",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 1.299814,
      "peak": 1.10364,
      "flat": 0.735813,
      "valley": 0.355725,
      "purchase_agent": 0.487445,
      "line_loss": 0.017274,
      "system_cost": 0.0578,
      "transmission_distribution": 0.1256,
      "government_funds": 0.047694,
      "demand_charge": 35.2,
      "capacity_charge": 22.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "20:00",
        "type": "flat"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网重庆95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "渝发改价格〔2023〕1420号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.38,
      "base_type": "agency_only",
      "formula_note": "工业分时高峰上浮60%，低谷下浮62%，大工业夏季尖峰在高峰基础上上浮20%",
      "special_period_note": "夏季7、8月大工业执行尖峰 11:00-12:00、17:00-18:00（单一制一般工商业不执行尖峰）"
    },
    "_deleted": false
  },
  {
    "id": "cq-2026-08-dl-110k",
    "province": "重庆",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 1.262566,
      "peak": 1.0726,
      "flat": 0.716413,
      "valley": 0.348353,
      "purchase_agent": 0.487445,
      "line_loss": 0.017274,
      "system_cost": 0.0578,
      "transmission_distribution": 0.1062,
      "government_funds": 0.047694,
      "demand_charge": 32.0,
      "capacity_charge": 20.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "20:00",
        "type": "flat"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网重庆95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "渝发改价格〔2023〕1420号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.38,
      "base_type": "agency_only",
      "formula_note": "工业分时高峰上浮60%，低谷下浮62%，大工业夏季尖峰在高峰基础上上浮20%",
      "special_period_note": "夏季7、8月大工业执行尖峰 11:00-12:00、17:00-18:00（单一制一般工商业不执行尖峰）"
    },
    "_deleted": false
  },
  {
    "id": "cq-2026-08-dl-220up",
    "province": "重庆",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 1.225318,
      "peak": 1.04156,
      "flat": 0.697013,
      "valley": 0.340981,
      "purchase_agent": 0.487445,
      "line_loss": 0.017274,
      "system_cost": 0.0578,
      "transmission_distribution": 0.0868,
      "government_funds": 0.047694,
      "demand_charge": 32.0,
      "capacity_charge": 20.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "08:00",
        "type": "valley"
      },
      {
        "start": "08:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "17:00",
        "type": "peak"
      },
      {
        "start": "17:00",
        "end": "20:00",
        "type": "flat"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "tip"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "peak"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网重庆95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "渝发改价格〔2023〕1420号",
    "float_rules": {
      "tip": 1.92,
      "peak": 1.6,
      "flat": 1.0,
      "valley": 0.38,
      "base_type": "agency_only",
      "formula_note": "工业分时高峰上浮60%，低谷下浮62%，大工业夏季尖峰在高峰基础上上浮20%",
      "special_period_note": "夏季7、8月大工业执行尖峰 11:00-12:00、17:00-18:00（单一制一般工商业不执行尖峰）"
    },
    "_deleted": false
  },
  {
    "id": "sx-2026-08-dy-lt1k",
    "province": "陕西",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "tip": 0.934945,
      "peak": 0.873985,
      "flat": 0.660625,
      "valley": 0.447265,
      "line_loss": 0.0133,
      "system_cost": 0.0865,
      "transmission_distribution": 0.2297,
      "government_funds": 0.026325
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网陕西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "陕发改价格〔2025〕1034号",
    "float_rules": {
      "tip": 1.9,
      "peak": 1.7,
      "flat": 1.0,
      "valley": 0.3,
      "base_type": "agency_only",
      "formula_note": "平段扣除输配、基金、系统费、线损后，峰谷浮动70%，尖峰上浮90%",
      "special_period_note": "夏季7、8月尖峰 19:00-21:00"
    },
    "_deleted": false
  },
  {
    "id": "sx-2026-08-dy-1_10k",
    "province": "陕西",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 0.913445,
      "peak": 0.852485,
      "flat": 0.639125,
      "valley": 0.425765,
      "line_loss": 0.0133,
      "system_cost": 0.0865,
      "transmission_distribution": 0.2082,
      "government_funds": 0.026325
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网陕西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "陕发改价格〔2025〕1034号",
    "float_rules": {
      "tip": 1.9,
      "peak": 1.7,
      "flat": 1.0,
      "valley": 0.3,
      "base_type": "agency_only",
      "formula_note": "平段扣除输配、基金、系统费、线损后，峰谷浮动70%，尖峰上浮90%",
      "special_period_note": "夏季7、8月尖峰 19:00-21:00"
    },
    "_deleted": false
  },
  {
    "id": "sx-2026-08-dy-35k",
    "province": "陕西",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 0.891945,
      "peak": 0.830985,
      "flat": 0.617625,
      "valley": 0.404265,
      "line_loss": 0.0133,
      "system_cost": 0.0865,
      "transmission_distribution": 0.1867,
      "government_funds": 0.026325
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网陕西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "陕发改价格〔2025〕1034号",
    "float_rules": {
      "tip": 1.9,
      "peak": 1.7,
      "flat": 1.0,
      "valley": 0.3,
      "base_type": "agency_only",
      "formula_note": "平段扣除输配、基金、系统费、线损后，峰谷浮动70%，尖峰上浮90%",
      "special_period_note": "夏季7、8月尖峰 19:00-21:00"
    },
    "_deleted": false
  },
  {
    "id": "sx-2026-08-dy-110k",
    "province": "陕西",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 0.865445,
      "peak": 0.804485,
      "flat": 0.591125,
      "valley": 0.377765,
      "line_loss": 0.0133,
      "system_cost": 0.0865,
      "transmission_distribution": 0.1602,
      "government_funds": 0.026325
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网陕西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "陕发改价格〔2025〕1034号",
    "float_rules": {
      "tip": 1.9,
      "peak": 1.7,
      "flat": 1.0,
      "valley": 0.3,
      "base_type": "agency_only",
      "formula_note": "平段扣除输配、基金、系统费、线损后，峰谷浮动70%，尖峰上浮90%",
      "special_period_note": "夏季7、8月尖峰 19:00-21:00"
    },
    "_deleted": false
  },
  {
    "id": "sx-2026-08-dy-220up",
    "province": "陕西",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 0.853445,
      "peak": 0.792485,
      "flat": 0.579125,
      "valley": 0.365765,
      "line_loss": 0.0133,
      "system_cost": 0.0865,
      "transmission_distribution": 0.1482,
      "government_funds": 0.026325
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网陕西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "陕发改价格〔2025〕1034号",
    "float_rules": {
      "tip": 1.9,
      "peak": 1.7,
      "flat": 1.0,
      "valley": 0.3,
      "base_type": "agency_only",
      "formula_note": "平段扣除输配、基金、系统费、线损后，峰谷浮动70%，尖峰上浮90%",
      "special_period_note": "夏季7、8月尖峰 19:00-21:00"
    },
    "_deleted": false
  },
  {
    "id": "sx-2026-08-dl-1_10k",
    "province": "陕西",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "tip": 0.832345,
      "peak": 0.771385,
      "flat": 0.558025,
      "valley": 0.344665,
      "line_loss": 0.0133,
      "system_cost": 0.0865,
      "transmission_distribution": 0.1271,
      "government_funds": 0.026325,
      "demand_charge": 37.6,
      "capacity_charge": 23.5
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网陕西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "陕发改价格〔2025〕1034号",
    "float_rules": {
      "tip": 1.9,
      "peak": 1.7,
      "flat": 1.0,
      "valley": 0.3,
      "base_type": "agency_only",
      "formula_note": "平段扣除输配、基金、系统费、线损后，峰谷浮动70%，尖峰上浮90%",
      "special_period_note": "夏季7、8月尖峰 19:00-21:00"
    },
    "_deleted": false
  },
  {
    "id": "sx-2026-08-dl-35k",
    "province": "陕西",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "tip": 0.811345,
      "peak": 0.750385,
      "flat": 0.537025,
      "valley": 0.323665,
      "line_loss": 0.0133,
      "system_cost": 0.0865,
      "transmission_distribution": 0.1061,
      "government_funds": 0.026325,
      "demand_charge": 37.6,
      "capacity_charge": 23.5
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网陕西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "陕发改价格〔2025〕1034号",
    "float_rules": {
      "tip": 1.9,
      "peak": 1.7,
      "flat": 1.0,
      "valley": 0.3,
      "base_type": "agency_only",
      "formula_note": "平段扣除输配、基金、系统费、线损后，峰谷浮动70%，尖峰上浮90%",
      "special_period_note": "夏季7、8月尖峰 19:00-21:00"
    },
    "_deleted": false
  },
  {
    "id": "sx-2026-08-dl-110k",
    "province": "陕西",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "tip": 0.791345,
      "peak": 0.730385,
      "flat": 0.517025,
      "valley": 0.303665,
      "line_loss": 0.0133,
      "system_cost": 0.0865,
      "transmission_distribution": 0.0861,
      "government_funds": 0.026325,
      "demand_charge": 32.8,
      "capacity_charge": 20.5
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网陕西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "陕发改价格〔2025〕1034号",
    "float_rules": {
      "tip": 1.9,
      "peak": 1.7,
      "flat": 1.0,
      "valley": 0.3,
      "base_type": "agency_only",
      "formula_note": "平段扣除输配、基金、系统费、线损后，峰谷浮动70%，尖峰上浮90%",
      "special_period_note": "夏季7、8月尖峰 19:00-21:00"
    },
    "_deleted": false
  },
  {
    "id": "sx-2026-08-dl-220up",
    "province": "陕西",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "tip": 0.778345,
      "peak": 0.717385,
      "flat": 0.504025,
      "valley": 0.290665,
      "line_loss": 0.0133,
      "system_cost": 0.0865,
      "transmission_distribution": 0.0731,
      "government_funds": 0.026325,
      "demand_charge": 32.8,
      "capacity_charge": 20.5
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "06:00",
        "type": "valley"
      },
      {
        "start": "06:00",
        "end": "11:00",
        "type": "flat"
      },
      {
        "start": "11:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "16:00",
        "type": "flat"
      },
      {
        "start": "16:00",
        "end": "19:00",
        "type": "peak"
      },
      {
        "start": "19:00",
        "end": "21:00",
        "type": "tip"
      },
      {
        "start": "21:00",
        "end": "23:00",
        "type": "peak"
      },
      {
        "start": "23:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网陕西95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "陕发改价格〔2025〕1034号",
    "float_rules": {
      "tip": 1.9,
      "peak": 1.7,
      "flat": 1.0,
      "valley": 0.3,
      "base_type": "agency_only",
      "formula_note": "平段扣除输配、基金、系统费、线损后，峰谷浮动70%，尖峰上浮90%",
      "special_period_note": "夏季7、8月尖峰 19:00-21:00"
    },
    "_deleted": false
  },
  {
    "id": "qh-2026-08-dy-lt1k",
    "province": "青海",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "peak": 0.621296,
      "flat": 0.482583,
      "valley": 0.339466,
      "purchase_agent": 0.22018,
      "line_loss": 0.006575,
      "system_cost": 0.041703,
      "transmission_distribution": 0.1926,
      "government_funds": 0.021525
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "17:00",
        "type": "valley"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网青海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "青发改价格〔2023〕891号",
    "float_rules": {
      "peak": 1.63,
      "flat": 1.0,
      "valley": 0.35,
      "base_type": "agency_only",
      "formula_note": "在代理购电价格基础上，高峰上浮63%，低谷下浮65%",
      "special_period_note": "青海光伏大省午间大发，09:00-17:00 全年执行低谷电价；全年无尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "qh-2026-08-dy-1_10k",
    "province": "青海",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.615296,
      "flat": 0.476583,
      "valley": 0.333466,
      "purchase_agent": 0.22018,
      "line_loss": 0.006575,
      "system_cost": 0.041703,
      "transmission_distribution": 0.1866,
      "government_funds": 0.021525
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "17:00",
        "type": "valley"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网青海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "青发改价格〔2023〕891号",
    "float_rules": {
      "peak": 1.63,
      "flat": 1.0,
      "valley": 0.35,
      "base_type": "agency_only",
      "formula_note": "在代理购电价格基础上，高峰上浮63%，低谷下浮65%",
      "special_period_note": "青海光伏大省午间大发，09:00-17:00 全年执行低谷电价；全年无尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "qh-2026-08-dy-35k",
    "province": "青海",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.609296,
      "flat": 0.470583,
      "valley": 0.327466,
      "purchase_agent": 0.22018,
      "line_loss": 0.006575,
      "system_cost": 0.041703,
      "transmission_distribution": 0.1806,
      "government_funds": 0.021525
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "17:00",
        "type": "valley"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网青海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "青发改价格〔2023〕891号",
    "float_rules": {
      "peak": 1.63,
      "flat": 1.0,
      "valley": 0.35,
      "base_type": "agency_only",
      "formula_note": "在代理购电价格基础上，高峰上浮63%，低谷下浮65%",
      "special_period_note": "青海光伏大省午间大发，09:00-17:00 全年执行低谷电价；全年无尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "qh-2026-08-dy-110k",
    "province": "青海",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.541996,
      "flat": 0.403283,
      "valley": 0.260166,
      "purchase_agent": 0.22018,
      "line_loss": 0.006575,
      "system_cost": 0.041703,
      "transmission_distribution": 0.1133,
      "government_funds": 0.021525
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "17:00",
        "type": "valley"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网青海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "青发改价格〔2023〕891号",
    "float_rules": {
      "peak": 1.63,
      "flat": 1.0,
      "valley": 0.35,
      "base_type": "agency_only",
      "formula_note": "在代理购电价格基础上，高峰上浮63%，低谷下浮65%",
      "special_period_note": "青海光伏大省午间大发，09:00-17:00 全年执行低谷电价；全年无尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "qh-2026-08-dy-220up",
    "province": "青海",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.535996,
      "flat": 0.397283,
      "valley": 0.254166,
      "purchase_agent": 0.22018,
      "line_loss": 0.006575,
      "system_cost": 0.041703,
      "transmission_distribution": 0.1073,
      "government_funds": 0.021525
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "17:00",
        "type": "valley"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网青海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "青发改价格〔2023〕891号",
    "float_rules": {
      "peak": 1.63,
      "flat": 1.0,
      "valley": 0.35,
      "base_type": "agency_only",
      "formula_note": "在代理购电价格基础上，高峰上浮63%，低谷下浮65%",
      "special_period_note": "青海光伏大省午间大发，09:00-17:00 全年执行低谷电价；全年无尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "qh-2026-08-dl-1_10k",
    "province": "青海",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.515796,
      "flat": 0.377083,
      "valley": 0.233966,
      "purchase_agent": 0.22018,
      "line_loss": 0.006575,
      "system_cost": 0.041703,
      "transmission_distribution": 0.0871,
      "government_funds": 0.021525,
      "demand_charge": 35.2,
      "capacity_charge": 22.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "17:00",
        "type": "valley"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网青海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "青发改价格〔2023〕891号",
    "float_rules": {
      "peak": 1.63,
      "flat": 1.0,
      "valley": 0.35,
      "base_type": "agency_only",
      "formula_note": "在代理购电价格基础上，高峰上浮63%，低谷下浮65%",
      "special_period_note": "青海光伏大省午间大发，09:00-17:00 全年执行低谷电价；全年无尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "qh-2026-08-dl-35k",
    "province": "青海",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.509796,
      "flat": 0.371083,
      "valley": 0.227966,
      "purchase_agent": 0.22018,
      "line_loss": 0.006575,
      "system_cost": 0.041703,
      "transmission_distribution": 0.0811,
      "government_funds": 0.021525,
      "demand_charge": 33.6,
      "capacity_charge": 21.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "17:00",
        "type": "valley"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网青海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "青发改价格〔2023〕891号",
    "float_rules": {
      "peak": 1.63,
      "flat": 1.0,
      "valley": 0.35,
      "base_type": "agency_only",
      "formula_note": "在代理购电价格基础上，高峰上浮63%，低谷下浮65%",
      "special_period_note": "青海光伏大省午间大发，09:00-17:00 全年执行低谷电价；全年无尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "qh-2026-08-dl-110k",
    "province": "青海",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.499796,
      "flat": 0.361083,
      "valley": 0.217966,
      "purchase_agent": 0.22018,
      "line_loss": 0.006575,
      "system_cost": 0.041703,
      "transmission_distribution": 0.0711,
      "government_funds": 0.021525,
      "demand_charge": 32.8,
      "capacity_charge": 20.5
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "17:00",
        "type": "valley"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网青海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "青发改价格〔2023〕891号",
    "float_rules": {
      "peak": 1.63,
      "flat": 1.0,
      "valley": 0.35,
      "base_type": "agency_only",
      "formula_note": "在代理购电价格基础上，高峰上浮63%，低谷下浮65%",
      "special_period_note": "青海光伏大省午间大发，09:00-17:00 全年执行低谷电价；全年无尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "qh-2026-08-dl-220up",
    "province": "青海",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.488696,
      "flat": 0.349983,
      "valley": 0.206866,
      "purchase_agent": 0.22018,
      "line_loss": 0.006575,
      "system_cost": 0.041703,
      "transmission_distribution": 0.06,
      "government_funds": 0.021525,
      "demand_charge": 31.2,
      "capacity_charge": 19.5
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "07:00",
        "type": "valley"
      },
      {
        "start": "07:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "17:00",
        "type": "valley"
      },
      {
        "start": "17:00",
        "end": "18:00",
        "type": "flat"
      },
      {
        "start": "18:00",
        "end": "22:00",
        "type": "peak"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "flat"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网青海95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "青发改价格〔2023〕891号",
    "float_rules": {
      "peak": 1.63,
      "flat": 1.0,
      "valley": 0.35,
      "base_type": "agency_only",
      "formula_note": "在代理购电价格基础上，高峰上浮63%，低谷下浮65%",
      "special_period_note": "青海光伏大省午间大发，09:00-17:00 全年执行低谷电价；全年无尖峰时段"
    },
    "_deleted": false
  },
  {
    "id": "hlj-2026-08-dy-lt1k",
    "province": "黑龙江",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "不满1kV",
    "prices": {
      "peak": 0.931562,
      "flat": 0.778009,
      "valley": 0.624457,
      "purchase_agent": 0.307105,
      "line_loss": 0.023575,
      "system_cost": 0.139704,
      "transmission_distribution": 0.2828,
      "government_funds": 0.024825
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "07:00",
        "type": "flat"
      },
      {
        "start": "07:00",
        "end": "08:00",
        "type": "peak"
      },
      {
        "start": "08:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "11:30",
        "type": "peak"
      },
      {
        "start": "11:30",
        "end": "12:00",
        "type": "flat"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "15:30",
        "type": "flat"
      },
      {
        "start": "15:30",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网黑龙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "黑发改价格〔2023〕",
    "float_rules": {
      "peak": 1.5,
      "flat": 1.0,
      "valley": 0.5,
      "base_type": "agency_only",
      "formula_note": "高峰上浮50%，低谷下浮50%，线损输配系统费基金不参与分时计算",
      "special_period_note": "暂停执行尖峰电价，适时启动"
    },
    "_deleted": false
  },
  {
    "id": "hlj-2026-08-dy-1_10k",
    "province": "黑龙江",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.921362,
      "flat": 0.767809,
      "valley": 0.614257,
      "purchase_agent": 0.307105,
      "line_loss": 0.023575,
      "system_cost": 0.139704,
      "transmission_distribution": 0.2726,
      "government_funds": 0.024825
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "07:00",
        "type": "flat"
      },
      {
        "start": "07:00",
        "end": "08:00",
        "type": "peak"
      },
      {
        "start": "08:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "11:30",
        "type": "peak"
      },
      {
        "start": "11:30",
        "end": "12:00",
        "type": "flat"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "15:30",
        "type": "flat"
      },
      {
        "start": "15:30",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网黑龙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "黑发改价格〔2023〕",
    "float_rules": {
      "peak": 1.5,
      "flat": 1.0,
      "valley": 0.5,
      "base_type": "agency_only",
      "formula_note": "高峰上浮50%，低谷下浮50%，线损输配系统费基金不参与分时计算",
      "special_period_note": "暂停执行尖峰电价，适时启动"
    },
    "_deleted": false
  },
  {
    "id": "hlj-2026-08-dy-35k",
    "province": "黑龙江",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.910762,
      "flat": 0.757209,
      "valley": 0.603657,
      "purchase_agent": 0.307105,
      "line_loss": 0.023575,
      "system_cost": 0.139704,
      "transmission_distribution": 0.262,
      "government_funds": 0.024825
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "07:00",
        "type": "flat"
      },
      {
        "start": "07:00",
        "end": "08:00",
        "type": "peak"
      },
      {
        "start": "08:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "11:30",
        "type": "peak"
      },
      {
        "start": "11:30",
        "end": "12:00",
        "type": "flat"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "15:30",
        "type": "flat"
      },
      {
        "start": "15:30",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网黑龙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "黑发改价格〔2023〕",
    "float_rules": {
      "peak": 1.5,
      "flat": 1.0,
      "valley": 0.5,
      "base_type": "agency_only",
      "formula_note": "高峰上浮50%，低谷下浮50%，线损输配系统费基金不参与分时计算",
      "special_period_note": "暂停执行尖峰电价，适时启动"
    },
    "_deleted": false
  },
  {
    "id": "hlj-2026-08-dy-110k",
    "province": "黑龙江",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.889762,
      "flat": 0.736209,
      "valley": 0.582657,
      "purchase_agent": 0.307105,
      "line_loss": 0.023575,
      "system_cost": 0.139704,
      "transmission_distribution": 0.241,
      "government_funds": 0.024825
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "07:00",
        "type": "flat"
      },
      {
        "start": "07:00",
        "end": "08:00",
        "type": "peak"
      },
      {
        "start": "08:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "11:30",
        "type": "peak"
      },
      {
        "start": "11:30",
        "end": "12:00",
        "type": "flat"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "15:30",
        "type": "flat"
      },
      {
        "start": "15:30",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网黑龙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "黑发改价格〔2023〕",
    "float_rules": {
      "peak": 1.5,
      "flat": 1.0,
      "valley": 0.5,
      "base_type": "agency_only",
      "formula_note": "高峰上浮50%，低谷下浮50%，线损输配系统费基金不参与分时计算",
      "special_period_note": "暂停执行尖峰电价，适时启动"
    },
    "_deleted": false
  },
  {
    "id": "hlj-2026-08-dy-220up",
    "province": "黑龙江",
    "city": null,
    "month": "2026-08",
    "category": "单一制-工商业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.874762,
      "flat": 0.721209,
      "valley": 0.567657,
      "purchase_agent": 0.307105,
      "line_loss": 0.023575,
      "system_cost": 0.139704,
      "transmission_distribution": 0.226,
      "government_funds": 0.024825
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "07:00",
        "type": "flat"
      },
      {
        "start": "07:00",
        "end": "08:00",
        "type": "peak"
      },
      {
        "start": "08:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "11:30",
        "type": "peak"
      },
      {
        "start": "11:30",
        "end": "12:00",
        "type": "flat"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "15:30",
        "type": "flat"
      },
      {
        "start": "15:30",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网黑龙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "黑发改价格〔2023〕",
    "float_rules": {
      "peak": 1.5,
      "flat": 1.0,
      "valley": 0.5,
      "base_type": "agency_only",
      "formula_note": "高峰上浮50%，低谷下浮50%，线损输配系统费基金不参与分时计算",
      "special_period_note": "暂停执行尖峰电价，适时启动"
    },
    "_deleted": false
  },
  {
    "id": "hlj-2026-08-dl-1_10k",
    "province": "黑龙江",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "1-10kV",
    "prices": {
      "peak": 0.787262,
      "flat": 0.633709,
      "valley": 0.480157,
      "purchase_agent": 0.307105,
      "line_loss": 0.023575,
      "system_cost": 0.139704,
      "transmission_distribution": 0.1385,
      "government_funds": 0.024825,
      "demand_charge": 36.8,
      "capacity_charge": 23.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "07:00",
        "type": "flat"
      },
      {
        "start": "07:00",
        "end": "08:00",
        "type": "peak"
      },
      {
        "start": "08:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "11:30",
        "type": "peak"
      },
      {
        "start": "11:30",
        "end": "12:00",
        "type": "flat"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "15:30",
        "type": "flat"
      },
      {
        "start": "15:30",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网黑龙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "黑发改价格〔2023〕",
    "float_rules": {
      "peak": 1.5,
      "flat": 1.0,
      "valley": 0.5,
      "base_type": "agency_only",
      "formula_note": "高峰上浮50%，低谷下浮50%，线损输配系统费基金不参与分时计算",
      "special_period_note": "暂停执行尖峰电价，适时启动"
    },
    "_deleted": false
  },
  {
    "id": "hlj-2026-08-dl-35k",
    "province": "黑龙江",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "35kV",
    "prices": {
      "peak": 0.765862,
      "flat": 0.612309,
      "valley": 0.458757,
      "purchase_agent": 0.307105,
      "line_loss": 0.023575,
      "system_cost": 0.139704,
      "transmission_distribution": 0.1171,
      "government_funds": 0.024825,
      "demand_charge": 36.8,
      "capacity_charge": 23.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "07:00",
        "type": "flat"
      },
      {
        "start": "07:00",
        "end": "08:00",
        "type": "peak"
      },
      {
        "start": "08:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "11:30",
        "type": "peak"
      },
      {
        "start": "11:30",
        "end": "12:00",
        "type": "flat"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "15:30",
        "type": "flat"
      },
      {
        "start": "15:30",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网黑龙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "黑发改价格〔2023〕",
    "float_rules": {
      "peak": 1.5,
      "flat": 1.0,
      "valley": 0.5,
      "base_type": "agency_only",
      "formula_note": "高峰上浮50%，低谷下浮50%，线损输配系统费基金不参与分时计算",
      "special_period_note": "暂停执行尖峰电价，适时启动"
    },
    "_deleted": false
  },
  {
    "id": "hlj-2026-08-dl-110k",
    "province": "黑龙江",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "110kV",
    "prices": {
      "peak": 0.751362,
      "flat": 0.597809,
      "valley": 0.444257,
      "purchase_agent": 0.307105,
      "line_loss": 0.023575,
      "system_cost": 0.139704,
      "transmission_distribution": 0.1026,
      "government_funds": 0.024825,
      "demand_charge": 35.2,
      "capacity_charge": 22.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "07:00",
        "type": "flat"
      },
      {
        "start": "07:00",
        "end": "08:00",
        "type": "peak"
      },
      {
        "start": "08:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "11:30",
        "type": "peak"
      },
      {
        "start": "11:30",
        "end": "12:00",
        "type": "flat"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "15:30",
        "type": "flat"
      },
      {
        "start": "15:30",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网黑龙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "黑发改价格〔2023〕",
    "float_rules": {
      "peak": 1.5,
      "flat": 1.0,
      "valley": 0.5,
      "base_type": "agency_only",
      "formula_note": "高峰上浮50%，低谷下浮50%，线损输配系统费基金不参与分时计算",
      "special_period_note": "暂停执行尖峰电价，适时启动"
    },
    "_deleted": false
  },
  {
    "id": "hlj-2026-08-dl-220up",
    "province": "黑龙江",
    "city": null,
    "month": "2026-08",
    "category": "两部制-大工业",
    "voltage_level": "220kV及以上",
    "prices": {
      "peak": 0.725062,
      "flat": 0.571509,
      "valley": 0.417957,
      "purchase_agent": 0.307105,
      "line_loss": 0.023575,
      "system_cost": 0.139704,
      "transmission_distribution": 0.0763,
      "government_funds": 0.024825,
      "demand_charge": 35.2,
      "capacity_charge": 22.0
    },
    "time_rules": [
      {
        "start": "00:00",
        "end": "05:00",
        "type": "valley"
      },
      {
        "start": "05:00",
        "end": "07:00",
        "type": "flat"
      },
      {
        "start": "07:00",
        "end": "08:00",
        "type": "peak"
      },
      {
        "start": "08:00",
        "end": "09:00",
        "type": "flat"
      },
      {
        "start": "09:00",
        "end": "11:30",
        "type": "peak"
      },
      {
        "start": "11:30",
        "end": "12:00",
        "type": "flat"
      },
      {
        "start": "12:00",
        "end": "14:00",
        "type": "valley"
      },
      {
        "start": "14:00",
        "end": "15:30",
        "type": "flat"
      },
      {
        "start": "15:30",
        "end": "20:00",
        "type": "peak"
      },
      {
        "start": "20:00",
        "end": "22:00",
        "type": "flat"
      },
      {
        "start": "22:00",
        "end": "24:00",
        "type": "valley"
      }
    ],
    "currency_unit": "元/kWh",
    "source": "国网黑龙江95598公告",
    "created_at": "2026-08-01T00:00:00.000Z",
    "last_modified": "2026-08-01T00:00:00.000Z",
    "policy_code": "黑发改价格〔2023〕",
    "float_rules": {
      "peak": 1.5,
      "flat": 1.0,
      "valley": 0.5,
      "base_type": "agency_only",
      "formula_note": "高峰上浮50%，低谷下浮50%，线损输配系统费基金不参与分时计算",
      "special_period_note": "暂停执行尖峰电价，适时启动"
    },
    "_deleted": false
  }
];
