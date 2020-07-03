import { Component, HostBinding } from '@angular/core';
import { MenuItemComponent } from '../menu-item/menu-item.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
  @HostBinding('style.display') public display = 'inline-block';
  @HostBinding('style.position') public position = 'absolute';

  private activeMenuItem: MenuItemComponent;

  constructor() {}

  public registerOpenedMenu(menuItem: MenuItemComponent): void {
    this.activeMenuItem = menuItem;
  }

  public closeOpenedMenuIfExists(): void {
    if (this.activeMenuItem) {
      this.activeMenuItem.clearContainer();
    }
  }
}
