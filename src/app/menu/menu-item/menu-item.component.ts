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
import { WINDOW_REF, DOCUMENT_REF } from '../injection-tokens';
import { MenuStateService } from '../menu-state.service';
import { Subscription } from 'rxjs';

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

  private boundClickOutsideHandler: (event: any) => void;
  private menuStateSubscription: Subscription;

  constructor(
    @Optional() private parent: MenuComponent,
    @Inject(WINDOW_REF) private windowRef: Window,
    @Inject(DOCUMENT_REF) private documentRef: Document,
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
      this.removeClickOutsideListener(this.boundClickOutsideHandler);
      this.clearContainer();
    }
  }

  public clearContainer(): void {
    this.viewContainerRef.clear();
  }

  public ngOnDestroy(): void {
    this.removeClickOutsideListener(this.boundClickOutsideHandler);
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
      this.assingClickOutsideHandler();
      this.addClickOutsideListener(this.boundClickOutsideHandler);
    }
  }

  private assingClickOutsideHandler(): void {
    this.boundClickOutsideHandler = this.closeMenuOnOutsideClick.bind(this);
  }

  private addClickOutsideListener(functionRef: (event: any) => void): void {
    this.windowRef.addEventListener('click', functionRef);
  }

  private removeClickOutsideListener(functionRef: (event: any) => void): void {
    this.windowRef.removeEventListener('click', functionRef);
  }

  private closeMenuOnOutsideClick({ target }): void {
    const appMenuItem = this.documentRef.querySelector(
      'app-menu-item > app-menu'
    );
    if (appMenuItem && !appMenuItem.parentElement.contains(target)) {
      this.removeClickOutsideListener(this.boundClickOutsideHandler);
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
