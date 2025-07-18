/*
 * Copyright 2024 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useState } from 'react';
import AssistantIcon from '@material-ui/icons/Assistant';
import { SidebarItem } from '@backstage/core-components';
import { IconComponent } from '@backstage/core-plugin-api';
import { ControlledRagModal, RagModalProps } from './RagModal';

export type SidebarRagModalProps = RagModalProps & {
  icon?: IconComponent;
};

export const SidebarRagModal = ({
  title = 'AI Assistant',
  icon = AssistantIcon,
  ...props
}: SidebarRagModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SidebarItem icon={icon} text={title} onClick={() => setOpen(true)} />
      <ControlledRagModal
        title={title}
        open={open}
        setOpen={setOpen}
        {...props}
      />
    </>
  );
};
