export const FILTER_BY_DAY = [
  { id: 1, title: "за сегодня", value: "1" },
  { id: 2, title: "за 3 дня", value: "2" },
  { id: 3, title: "за неделю", value: "3" },
  { id: 4, title: "за месяц", value: "4" },
];

function getFormattedDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTomorrowDate() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return getFormattedDate(tomorrow);
}

function getDateToday() {
  const today = new Date();
  return getFormattedDate(today);
}

function getDateThreeDaysAgo() {
  const today = new Date();
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 3);
  return getFormattedDate(threeDaysAgo);
}

function getDateAWeekAgo() {
  const today = new Date();
  const aWeekAgo = new Date(today);
  aWeekAgo.setDate(today.getDate() - 7);
  return getFormattedDate(aWeekAgo);
}

function getDateAMonthAgo() {
  const today = new Date();
  const aMonthAgo = new Date(today);
  aMonthAgo.setMonth(today.getMonth() - 1);
  return getFormattedDate(aMonthAgo);
}

export const getFilterDateRange = (id: number) => {
  let startDate = "";

  switch (id) {
    case 1:
      startDate = getDateToday();
      break;
    case 2:
      startDate = getDateThreeDaysAgo();
      break;
    case 3:
      startDate = getDateAWeekAgo();
      break;
    case 4:
      startDate = getDateAMonthAgo();
      break;
    default:
      break;
  }

  return [startDate, getTomorrowDate()];
};

export const getEditTicketDates = () => {
  return [getToday(), getTomorrowDate()];
};

export const getListTicketDates = () => {
  return [getFirstDateOfCurrentMonth(), getToday()];
};

export const getToday = () => {
  const todaysDateOfCurrentMonth = new Date();
  return todaysDateOfCurrentMonth.toISOString().split("T")[0];
};

export const getFirstDateOfCurrentMonth = () => {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 2);

  return firstDay.toISOString().split("T")[0];
};

export const getDefaultCriteria = (
  role: string,
  endDate: string,
  startDate: string,
  currentUser: Record<string, any>
) => {
  if (role === "AGENT") {
    let criteria: Record<string, any>[] = [];
    let criteriaOne: Record<string, any>[] = [];

    criteriaOne.push({ fieldName: "sales.id", operator: "=", value: currentUser.id });
    criteriaOne.push({
      operator: "and",
      criteria: [
        { fieldName: "sales", operator: "isNull" },
        { fieldName: "opera", operator: "isNull" },
      ],
    });

    criteria.push({
      fieldName: "docIss",
      operator: "between",
      value: `${startDate}`,
      value2: `${endDate}`,
    });

    criteria.push({
      operator: "or",
      criteria: criteriaOne,
    });

    return {
      operator: "and",
      criteria: criteria,
    };
  } else if (role === "MANAGER") {
    let criteria: Record<string, any>[] = [];
    let criteriaOne: Record<string, any>[] = [];
    const managerDepartments = currentUser.partner.departments;
    if (managerDepartments) {
      managerDepartments.map((department: Record<string, any>) => {
        criteriaOne.push({ fieldName: "sales.partner.departments.code", operator: "=", value: `${department.code}` });
      });
    }

    criteriaOne.push({
      operator: "and",
      criteria: [
        { fieldName: "sales", operator: "isNull" },
        { fieldName: "opera", operator: "isNull" },
      ],
    });

    criteria.push({
      fieldName: "docIss",
      operator: "between",
      value: `${startDate}`,
      value2: `${endDate}`,
    });

    criteria.push({
      operator: "or",
      criteria: criteriaOne,
    });

    return {
      operator: "and",
      criteria: criteria,
    };
  }
  return null;
};
