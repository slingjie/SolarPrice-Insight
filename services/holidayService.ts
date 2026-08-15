import { getDatabase } from './db';
import type { HolidayDefinition } from '../types';
import { syncOutboxService } from './sync/syncOutboxService';
import { getSyncManager } from './sync/syncManager';
import { getDocModifiedAt } from './sync/syncAdapters';

export async function getAllHolidays(): Promise<HolidayDefinition[]> {
  const db = await getDatabase();
  const docs = await db.holidays.find().exec();
  return docs.map(doc => doc.toJSON() as HolidayDefinition);
}

export async function saveHoliday(holiday: HolidayDefinition): Promise<void> {
  const db = await getDatabase();
  await db.holidays.upsert(holiday);
  await syncOutboxService.enqueueUpsert({
    collection: 'holidays',
    docId: holiday.id,
    modifiedAt: getDocModifiedAt('holidays', holiday as unknown as Record<string, unknown>),
    doc: holiday as unknown as Record<string, unknown>,
  });
  getSyncManager().requestSyncSoon();
}

export async function deleteHoliday(id: string): Promise<void> {
  const db = await getDatabase();
  const doc = await db.holidays.findOne(id).exec();
  if (doc) {
    await doc.remove();
    await syncOutboxService.enqueueDelete({
      collection: 'holidays',
      docId: id,
      modifiedAt: new Date().toISOString(),
    });
    getSyncManager().requestSyncSoon();
  }
}

export async function initDefaultHolidays(): Promise<void> {
  const db = await getDatabase();
  const existing = await getAllHolidays();
  
  if (existing.length > 0) {
    return;
  }

  const defaultHolidays: HolidayDefinition[] = [
    {
      id: 'default-new-year',
      name: '元旦',
      startDate: '01-01',
      endDate: '01-03',
      isDefault: true,
      updated_at: new Date().toISOString()
    },
    {
      id: 'default-spring-festival',
      name: '春节',
      startDate: '01-31',
      endDate: '02-06',
      isDefault: true,
      updated_at: new Date().toISOString()
    },
    {
      id: 'default-tomb-sweeping',
      name: '清明节',
      startDate: '04-04',
      endDate: '04-06',
      isDefault: true,
      updated_at: new Date().toISOString()
    },
    {
      id: 'default-labor-day',
      name: '劳动节',
      startDate: '05-01',
      endDate: '05-05',
      isDefault: true,
      updated_at: new Date().toISOString()
    },
    {
      id: 'default-dragon-boat',
      name: '端午节',
      startDate: '06-08',
      endDate: '06-10',
      isDefault: true,
      updated_at: new Date().toISOString()
    },
    {
      id: 'default-mid-autumn',
      name: '中秋节',
      startDate: '09-15',
      endDate: '09-17',
      isDefault: true,
      updated_at: new Date().toISOString()
    },
    {
      id: 'default-national-day',
      name: '国庆节',
      startDate: '10-01',
      endDate: '10-07',
      isDefault: true,
      updated_at: new Date().toISOString()
    }
  ];

  for (const holiday of defaultHolidays) {
    await db.holidays.upsert(holiday);
    await syncOutboxService.enqueueUpsert({
      collection: 'holidays',
      docId: holiday.id,
      modifiedAt: getDocModifiedAt('holidays', holiday as unknown as Record<string, unknown>),
      doc: holiday as unknown as Record<string, unknown>,
    });
  }
  getSyncManager().requestSyncSoon();
}

export function expandHolidayDates(holiday: HolidayDefinition): string[] {
  const dates: string[] = [];
  
  const [startMonth, startDay] = holiday.startDate.split('-').map(Number);
  const [endMonth, endDay] = holiday.endDate.split('-').map(Number);
  
  let currentMonth = startMonth;
  let currentDay = startDay;
  
  const daysInMonth = (month: number): number => {
    const monthDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return monthDays[month - 1];
  };
  
  const formatDate = (month: number, day: number): string => {
    return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };
  
  while (true) {
    const dateStr = formatDate(currentMonth, currentDay);
    dates.push(dateStr);
    
    if (dateStr === '02-29') {
      console.warn(
        `[Holiday Warning] 节假日 "${holiday.name}" 包含闰日 02-29，该日期仅在闰年存在，请确认是否合理。`
      );
    }
    
    if (currentMonth === endMonth && currentDay === endDay) {
      break;
    }
    
    currentDay++;
    if (currentDay > daysInMonth(currentMonth)) {
      currentDay = 1;
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
      }
    }
  }
  
  return dates;
}
