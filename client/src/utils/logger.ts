
export const logStateChange = (component: string, action: string, data?: any) => {
  console.log(`[${component}] ${action}`, data || '');
};

export const logError = (component: string, error: any) => {
  console.error(`[${component} Error]`, error);
};
