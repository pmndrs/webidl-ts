import { expect, describe, it } from '@jest/globals'
import { convert } from '../src/convert'
import { multiLine } from './utils'

describe('convert', () => {
  it('supports operations', async () => {
    const idl = multiLine(
      'interface Foo {', //
      '    void bar();', //
      '};', //
    )

    const ts = await convert(idl)

    expect(ts).toBe(
      multiLine(
        'interface Foo {', //
        '    bar(): void;', //
        '}', //
      ),
    )
  })

  it('supports static operations', async () => {
    const idl = multiLine(
      'interface Foo {', //
      '    static void bar();', //
      '};', //
    )

    const ts = await convert(idl)

    expect(ts).toBe(
      multiLine(
        'interface Foo {', //
        '    static bar(): void;', //
        '}', //
      ),
    )
  })

  it('supports creating interfaces for namespaces', async () => {
    const idl = multiLine(
      'namespace Foo {', //
      '    void bar();', //
      '};', //
    )

    const ts = await convert(idl)

    expect(ts).toBe(
      multiLine(
        'interface Foo {', //
        '    bar(): void;', //
        '}', //
      ),
    )
  })

  it('supports maplike declarations', async () => {
    const idl = multiLine(
      'interface Foo {', //
      '    maplike<unsigned long, DOMString>;', //
      '};', //
    )

    const ts = await convert(idl)

    expect(ts).toBe(
      multiLine(
        'type Foo = Map<number, string>;', //
      ),
    )
  })

  it('supports setlike declarations', async () => {
    const idl = multiLine(
      'interface Foo {', //
      '    setlike<unsigned long>;', //
      '};', //
    )

    const ts = await convert(idl)

    expect(ts).toBe(
      multiLine(
        'type Foo = Set<number>;', //
      ),
    )
  })

  it('support nullable types', async () => {
    const idl = multiLine(
      'interface Foo {', //
      '    attribute long? bar;', //
      '};', //
    )

    const ts = await convert(idl)

    expect(ts).toBe(
      multiLine(
        'interface Foo {', //
        '    bar: number | null;', //
        '}', //
      ),
    )
  })

  describe('enums', () => {
    it('converts enums to union types', async () => {
      const idl = multiLine(
        'enum Foo {', //
        '    "bar",', //
        '    "baz"', //
        '};', //
      )
  
      const ts = await convert(idl)
  
      expect(ts).toBe(
        multiLine(
          'type Foo = "bar" | "baz";', //
        ),
      )
    })
  
    describe('emscripten enabled', () => {
      it('supports enums', async () => {
        const idl = multiLine(
          'enum Foo {', //
          '    "bar",', //
          '    "baz"', //
          '};', //
        )
    
        const ts = await convert(idl, { emscripten: true })
    
        expect(ts).toBe(
          multiLine(
            'declare function Module<T>(target?: T): Promise<T & typeof Module>;', //
            'declare module Module {', //
            '    function destroy(obj: any): void;', //
            '    function _malloc(size: number): number;', //
            '    function _free(ptr: number): void;', //
            '    const HEAP8: Int8Array;', //
            '    const HEAP16: Int16Array;', //
            '    const HEAP32: Int32Array;', //
            '    const HEAPU8: Uint8Array;', //
            '    const HEAPU16: Uint16Array;', //
            '    const HEAPU32: Uint32Array;', //
            '    const HEAPF32: Float32Array;', //
            '    const HEAPF64: Float64Array;', //
            '    const bar: unknown;', //
            '    const baz: unknown;', //
            '    type Foo = typeof bar | typeof baz;', //
            '    function _emscripten_enum_Foo_bar(): Foo;', //
            '    function _emscripten_enum_Foo_baz(): Foo;', //
            '}', //
          ),
        )
      })

      it('supports enums declared in namespaces', async () => {
        const idl = multiLine(
          'enum Foo {', //
          '    "namespace::bar",', //
          '    "namespace::baz"', //
          '};', //
        )
    
        const ts = await convert(idl, { emscripten: true })
    
        expect(ts).toBe(
          multiLine(
            'declare function Module<T>(target?: T): Promise<T & typeof Module>;', //
            'declare module Module {', //
            '    function destroy(obj: any): void;', //
            '    function _malloc(size: number): number;', //
            '    function _free(ptr: number): void;', //
            '    const HEAP8: Int8Array;', //
            '    const HEAP16: Int16Array;', //
            '    const HEAP32: Int32Array;', //
            '    const HEAPU8: Uint8Array;', //
            '    const HEAPU16: Uint16Array;', //
            '    const HEAPU32: Uint32Array;', //
            '    const HEAPF32: Float32Array;', //
            '    const HEAPF64: Float64Array;', //
            '    const bar: unknown;', //
            '    const baz: unknown;', //
            '    type Foo = typeof bar | typeof baz;', //
            '    function _emscripten_enum_Foo_bar(): Foo;', //
            '    function _emscripten_enum_Foo_baz(): Foo;', //
            '}', //
          ),
        )
      })
  
      it('omits duplicate enum member names from the generated types', async () => {
        const idl = multiLine(
          'enum Foo {', //
          '    "namespace::bar",', //
          '    "namespace::baz"', //
          '};', //
          'enum Bar {', //
          '    "namespace::bar",', //
          '    "namespace::baz"', //
          '};', //
        )
    
        const ts = await convert(idl, { emscripten: true })
    
        expect(ts).toBe(
          multiLine(
            'declare function Module<T>(target?: T): Promise<T & typeof Module>;', //
            'declare module Module {', //
            '    function destroy(obj: any): void;', //
            '    function _malloc(size: number): number;', //
            '    function _free(ptr: number): void;', //
            '    const HEAP8: Int8Array;', //
            '    const HEAP16: Int16Array;', //
            '    const HEAP32: Int32Array;', //
            '    const HEAPU8: Uint8Array;', //
            '    const HEAPU16: Uint16Array;', //
            '    const HEAPU32: Uint32Array;', //
            '    const HEAPF32: Float32Array;', //
            '    const HEAPF64: Float64Array;', //
            '    const bar: unknown;', //
            '    const baz: unknown;', //
            '    type Foo = typeof bar | typeof baz;', //
            '    function _emscripten_enum_Foo_bar(): Foo;', //
            '    function _emscripten_enum_Foo_baz(): Foo;', //
            '    type Bar = typeof bar | typeof baz;', //
            '    function _emscripten_enum_Bar_bar(): Bar;', //
            '    function _emscripten_enum_Bar_baz(): Bar;', //
            '}', //
          ),
        )
      })
    })

  })

  describe('emscripten', () => {
    it('supports unsigned integer arrays', async () => {
      const idl = multiLine(
        'interface Foo {', //
        '    attribute unsigned long[] bar;', //
        '};', //
      )

      const ts = await convert(idl, { emscripten: true })

      expect(ts).toContain('bar: ReadonlyArray<number>;')
    })
  })
})
