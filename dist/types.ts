import { GraphQLResolveInfo } from "graphql";
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
	[P in K]-?: NonNullable<T[P]>;
};
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
	[K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
	T extends { [key: string]: unknown },
	K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
	| T
	| {
			[P in keyof T]?: P extends " $fragmentName" | "__typename"
				? T[P]
				: never;
	  };

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
	resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
	| ResolverFn<TResult, TParent, TContext, TArgs>
	| ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
	parent: TParent,
	args: TArgs,
	context: TContext,
	info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
	parent: TParent,
	args: TArgs,
	context: TContext,
	info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
	parent: TParent,
	args: TArgs,
	context: TContext,
	info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
	TResult,
	TKey extends string,
	TParent,
	TContext,
	TArgs
> {
	subscribe: SubscriptionSubscribeFn<
		{ [key in TKey]: TResult },
		TParent,
		TContext,
		TArgs
	>;
	resolve?: SubscriptionResolveFn<
		TResult,
		{ [key in TKey]: TResult },
		TContext,
		TArgs
	>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
	subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
	resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
	TResult,
	TKey extends string,
	TParent,
	TContext,
	TArgs
> =
	| SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
	| SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
	TResult,
	TKey extends string,
	TParent = {},
	TContext = {},
	TArgs = {}
> =
	| ((
			...args: any[]
	  ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
	| SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
	parent: TParent,
	context: TContext,
	info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
	obj: T,
	context: TContext,
	info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
	TResult = {},
	TParent = {},
	TContext = {},
	TArgs = {}
> = (
	next: NextResolverFn<TResult>,
	parent: TParent,
	args: TArgs,
	context: TContext,
	info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
	Boolean: ResolverTypeWrapper<Scalars["Boolean"]["output"]>;
	CodeBox: ResolverTypeWrapper<CodeBox>;
	Int: ResolverTypeWrapper<Scalars["Int"]["output"]>;
	Mutation: ResolverTypeWrapper<{}>;
	Query: ResolverTypeWrapper<{}>;
	String: ResolverTypeWrapper<Scalars["String"]["output"]>;
	codeBlock: CodeBlock;
	lang: ResolverTypeWrapper<Lang>;
	returnStats: ResolverTypeWrapper<ReturnStats>;
	snipBox: SnipBox;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
	Boolean: Scalars["Boolean"]["output"];
	CodeBox: CodeBox;
	Int: Scalars["Int"]["output"];
	Mutation: {};
	Query: {};
	String: Scalars["String"]["output"];
	codeBlock: CodeBlock;
	lang: Lang;
	returnStats: ReturnStats;
	snipBox: SnipBox;
};

export type CodeBoxResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes["CodeBox"] = ResolversParentTypes["CodeBox"]
> = {
	code?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
	title?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"]
> = {
	snipAdd?: Resolver<
		ResolversTypes["returnStats"],
		ParentType,
		ContextType,
		RequireFields<MutationSnipAddArgs, "codeSnip">
	>;
};

export type QueryResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"]
> = {
	langFind?: Resolver<
		ResolversTypes["lang"],
		ParentType,
		ContextType,
		RequireFields<QueryLangFindArgs, "langName">
	>;
	langList?: Resolver<Array<ResolversTypes["lang"]>, ParentType, ContextType>;
	langNames?: Resolver<string[], ParentType, ContextType>;
	titleFind?: Resolver<
		Maybe<Array<ResolversTypes["lang"]>>,
		ParentType,
		ContextType,
		RequireFields<QueryTitleFindArgs, "title">
	>;
};

export type LangResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes["lang"] = ResolversParentTypes["lang"]
> = {
	codeBoxes?: Resolver<
		Array<Maybe<ResolversTypes["CodeBox"]>>,
		ParentType,
		ContextType
	>;
	langName?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReturnStatsResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes["returnStats"] = ResolversParentTypes["returnStats"]
> = {
	id?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
	message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
	CodeBox?: CodeBoxResolvers<ContextType>;
	Mutation?: MutationResolvers<ContextType>;
	Query?: QueryResolvers<ContextType>;
	lang?: LangResolvers<ContextType>;
	returnStats?: ReturnStatsResolvers<ContextType>;
};

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: { input: string; output: string };
	String: { input: string; output: string };
	Boolean: { input: boolean; output: boolean };
	Int: { input: number; output: number };
	Float: { input: number; output: number };
};

export type CodeBox = {
	__typename?: "CodeBox";
	code: Scalars["String"]["output"];
	title: Scalars["String"]["output"];
};

export type Mutation = {
	__typename?: "Mutation";
	snipAdd: ReturnStats;
};

export type MutationSnipAddArgs = {
	codeSnip: SnipBox;
};

export type Query = {
	__typename?: "Query";
	langFind: Lang;
	langList: Array<Lang>;
	langNames: Array<Scalars["String"]["output"]>;
	titleFind?: Maybe<Array<Maybe<Lang>>>;
};

export type QueryLangFindArgs = {
	langName: Scalars["String"]["input"];
};

export type QueryTitleFindArgs = {
	title: Scalars["String"]["input"];
};

export type CodeBlock = {
	code: Scalars["String"]["input"];
	title: Scalars["String"]["input"];
};

export type Lang = {
	__typename?: "lang";
	codeBoxes: Array<Maybe<CodeBox>>;
	langName: Scalars["String"]["output"];
};

export type ReturnStats = {
	__typename?: "returnStats";
	id: Scalars["Int"]["output"];
	message: Scalars["String"]["output"];
};

export type SnipBox = {
	codeBox: CodeBlock;
	langName: Scalars["String"]["input"];
};
