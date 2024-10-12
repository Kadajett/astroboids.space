type Vector2D = { x: number; y: number };

class CanvasStore {
  private static instance: CanvasStore;

  private _camera: Vector2D = { x: 0, y: 0 };
  private _screen: { width: number; height: number } = { width: 0, height: 0 };

  private _scale: Vector2D = { x: 1, y: 1 };
  private constructor() {}

  static getInstance(): CanvasStore {
    if (!CanvasStore.instance) {
      CanvasStore.instance = new CanvasStore();
    }
    return CanvasStore.instance;
  }

  initialize(width: number, height: number): void {
    this._screen = { width, height };
    this._camera = { x: 0, y: 0 };
    this._scale = { x: 1, y: 1 };
  }

  get camera(): Vector2D {
    return this._camera;
  }

  get screen(): { width: number; height: number } {
    return this._screen;
  }

  moveCamera(dx: number, dy: number): void {
    this._camera.x += dx;
    this._camera.y += dy;
  }

  get scale(): Vector2D {
    return this._scale;
  }
}

export default CanvasStore.getInstance();

