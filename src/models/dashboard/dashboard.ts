export interface ITooltipContent {
  active: boolean;
  payload: {
    name: string;
    value: number;
    fill: string;
    payload: IChart;
  }[];
}

export interface IChart {
  name: string;
  v1: number | string;
}

export interface IDataProps {
  data: Record<string, any>[];
}
