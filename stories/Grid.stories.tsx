import { Meta, StoryObj } from '@storybook/react';
import Teste from '../src/grid/teste';

const meta: Meta = {
  title: 'Grid/Base',
  component: Teste,
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

export const Default: StoryObj = {};
