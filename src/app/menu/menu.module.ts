import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { WINDOW_REF, DOCUMENT_REF } from './injection-tokens';

@NgModule({
  declarations: [MenuComponent, MenuItemComponent],
  exports: [MenuComponent, MenuItemComponent],
  imports: [CommonModule],
  providers: [
    {
      provide: WINDOW_REF,
      useValue: window,
    },
    {
      provide: DOCUMENT_REF,
      useValue: document,
    },
  ],
})
export class MenuModule {}
