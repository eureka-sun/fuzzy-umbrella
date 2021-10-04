/* eslint-disable @typescript-eslint/no-explicit-any */

type ValidationErrorItem = {
  message: string;
  type: string;
  context?: {
    label?: string;
  };
};

type CelebrateMapperMessage = {
  type: string;
  message: string;
  label: string;
};

class CelebrateMapper {
  static render = (data: ValidationErrorItem): CelebrateMapperMessage => {
    return {
      type: data.type,
      message: data.message,
      label: data?.context?.label,
    };
  };

  static renderMany = (
    data: ValidationErrorItem[],
  ): CelebrateMapperMessage[] => {
    return data.map(CelebrateMapper.render);
  };
}

export { CelebrateMapper };
