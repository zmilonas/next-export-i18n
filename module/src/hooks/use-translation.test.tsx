/**
 * @jest-environment jsdom
 */
// import { renderHook, act } from '@testing-library/react-hooks';
import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks/dom'; // will use react-dom
import { useTranslation } from './use-translation';
import {I18N} from "../types";

// import useSelectedLanguage from './use-selected-language';

const defaultConfig: { __esModule: boolean; i18n: I18N } =  {
	__esModule: true,
	i18n: {
		translations: {
			mock: {
				template: '{{count}} times',
				string: 'mock',
				// @ts-expect-error We're testing for invalid value specifically
				arr: [1, 2, 3],
				obj: { key: 'valueMock' },
				levelOne: { levelOneString: 'levelOneMock' },
				"example.com": "example.mock",
			},
		},
		defaultLang: 'mock',
	},
};

jest.mock('next/router', () => ({
	useRouter() {
		return {
			route: '/',
			pathname: '',
			query: '',
			asPath: '',
		};
	},
}));
const i18nObj = jest.spyOn(require('./../../../i18n/index'), 'default');
const useRouter = jest.spyOn(require('next/router'), 'useRouter');

jest.mock('./use-selected-language', () => {
	return {
		__esModule: true,
		default: () => { },
	};
});

const useSelectedLanguage = jest.spyOn(
	require('./use-selected-language'),
	'default'
);

beforeAll(() => {
	i18nObj.mockImplementation(() => defaultConfig)
});

beforeEach(() => {
	useSelectedLanguage.mockImplementation(() => ({
		lang: 'mock',
	}));
});

afterEach(() => {
	cleanup();
	jest.clearAllMocks();
});

describe('The hook exports a function ', () => {
	it(`t() `, async () => {
		const { result } = renderHook(() => useTranslation());
		expect(result.current.t).toBeInstanceOf(Function);
	});

	it(`t() which returns a string interpolated with a template `, async () => {
		const key = 'template';
		const expectation = '2 times';
		const { result } = renderHook(() => useTranslation());
		expect(result.current.t(key, { count: 2 })).toEqual(expectation);
	});

	it(`t() which returns the value for a simple key based on the language`, async () => {
		const key = 'string';
		const expectation = 'mock';
		const { result } = renderHook(() => useTranslation());
		expect(result.current.t(key)).toEqual(expectation);
	});

	it(`t() which returns the value for a multilevel key based on the langage`, async () => {
		const key = 'levelOne.levelOneString';
		const expectation = 'levelOneMock';
		const { result } = renderHook(() => useTranslation());
		expect(result.current.t(key)).toEqual(expectation);
	});

	it(`t() which returns the value for a multilevel key based on the langage`, async () => {
		const newConfig = { ...defaultConfig };
		newConfig.i18n.nestKeysWithDot = false;
		i18nObj.mockImplementation(() => newConfig);
		const key = 'example.com';
		const expectation = 'example.mock';
		const { result } = renderHook(() => useTranslation());
		expect(result.current.t(key)).toEqual(expectation);
	});

	it(`t() which returns the value (array) for a simple key based on the langage`, async () => {
		const key = 'arr';
		const expectation = [1, 2, 3];
		const { result } = renderHook(() => useTranslation());
		expect(result.current.t(key)).toEqual(expectation);
	});

	it(`t() which returns the value (obj) for a simple key based on the langage`, async () => {
		const key = 'obj';
		const expectation = { key: 'valueMock' };
		const { result } = renderHook(() => useTranslation());
		expect(result.current.t(key)).toEqual(expectation);
	});

	it(`t() which returns the key if there is no enty for this key`, async () => {
		const key = 'invalid.key';
		const expectation = key;
		const { result } = renderHook(() => useTranslation());
		expect(result.current.t(key)).toEqual(expectation);
	});
});

describe('The hook returns ', () => {
	it(`the query object with lang = forceLang if forceLang is passed `, async () => {
		const expectation = [
			{
				bar: 'baz',
				lang: 'forced',
			},
		];
		useRouter.mockImplementation(() => ({
			query: { bar: 'baz', lang: 'foo' },
		}));
		useSelectedLanguage.mockImplementation(() => ({
			lang: 'bar',
		}));

		// const { result } = renderHook(() => useLanguageQuery('forced'));
		// expect(result.current).toEqual(expectation);
	});
});
//
