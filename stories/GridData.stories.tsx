import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import Grid from '../src/grid/grid';
import { ColunaBruta, GridProps } from '../src/grid/utils/type';
import { generateData } from '../src/grid/teste';

const meta: Meta<GridProps<ColunaBruta>> = {
  title: 'Grid/Data',
  component: Grid,
  parameters: {
    controls: { expanded: true },
  },
  decorators: [
    (Story) => {
      return <div className='h-400' >
        {Story()}
      </div>
    }
  ],
};

export default meta;

const { coluna, data } = generateData(100, 10);

export const Default: StoryObj<GridProps<ColunaBruta>> = {
  args: {
    colunas: coluna,
    data: data,
  }
};
