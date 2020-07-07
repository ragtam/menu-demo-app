import {
  Component,
  Input,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  Optional,
  Inject,
  OnDestroy,
} from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { isNullOrUndefined } from 'util';
import { MenuStateService } from '../menu-state.service';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { EventManager } from '@angular/platform-browser';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.css'],
})
export class MenuItemComponent implements OnDestroy {
  @Input() public menuFor: TemplateRef<MenuComponent>;

  @ViewChild('viewContainerRef', { read: ViewContainerRef })
  public viewContainerRef: ViewContainerRef;

  public get containerCssClass(): string {
    return this.isRoot()
      ? 'button__container--root'
      : 'button__container--leaf';
  }

  private menuStateSubscription: Subscription;
  private removeGlobalEventListener: Function;

  constructor(
    @Optional() private parent: MenuComponent,
    @Inject(DOCUMENT) private documentRef: Document,
    private eventManager: EventManager,
    private menuStateService: MenuStateService
  ) {}

  public onClick(): void {
    if (this.isLeaf()) {
      this.broadcastMenuClear();
    } else if (this.containerIsEmpty()) {
      this.addHandlersForRootElement();
      this.closeAlreadyOpenedMenuInTheSameSubtree();
      this.registerOpenedMenu();
      this.addTemplateToContainer(this.menuFor);
    } else {
      this.removeClickOutsideListener();
      this.clearContainer();
    }
  }

  public clearContainer(): void {
    this.viewContainerRef.clear();
  }

  public ngOnDestroy(): void {
    this.removeClickOutsideListener();
    this.unsubscribe();
  }

  private isLeaf(): boolean {
    return !this.isRoot() && !this.hasNestedSubMenu();
  }

  private hasNestedSubMenu(): boolean {
    return !!this.menuFor;
  }

  private closeAlreadyOpenedMenuInTheSameSubtree(): void {
    if (this.parent) {
      this.parent.closeOpenedMenuIfExists();
    }
  }

  private registerOpenedMenu(): void {
    if (this.parent) {
      this.parent.registerOpenedMenu(this);
    }
  }

  private containerIsEmpty(): boolean {
    return this.viewContainerRef.length === 0;
  }

  private addTemplateToContainer(template: TemplateRef<any>): void {
    this.viewContainerRef.createEmbeddedView(template);
  }

  private isRoot(): boolean {
    return isNullOrUndefined(this.parent);
  }

  private addHandlersForRootElement() {
    if (this.isRoot()) {
      this.subscribeToClearMenuMessages();
      this.addClickOutsideListener();
    }
  }

  private addClickOutsideListener(): void {
    this.removeGlobalEventListener = this.eventManager.addGlobalEventListener(
      'window',
      'click',
      this.closeMenuOnOutsideClick.bind(this)
    );
  }

  private removeClickOutsideListener(): void {
    if (this.removeGlobalEventListener) {
      this.removeGlobalEventListener();
    }
  }

  private closeMenuOnOutsideClick({ target }): void {
    const appMenuItem = this.documentRef.querySelector(
      'app-menu-item > app-menu'
    );
    if (appMenuItem && !appMenuItem.parentElement.contains(target)) {
      this.removeClickOutsideListener();
      this.broadcastMenuClear();
    }
  }

  private broadcastMenuClear(): void {
    this.menuStateService.clearMenu();
  }

  private subscribeToClearMenuMessages(): void {
    this.menuStateSubscription = this.menuStateService.state$.subscribe(() => {
      this.clearContainer();
    });
  }

  private unsubscribe(): void {
    if (this.menuStateSubscription) {
      this.menuStateSubscription.unsubscribe();
    }
  }
}
