export type WhosOutContentProps = {
  start_time?: string;
  end_time?: string;
};

export type TimeOff = {
  id: number;
  type: string;
  employeeId: number;
  name: string;
  start: string;
  end: string;
};
