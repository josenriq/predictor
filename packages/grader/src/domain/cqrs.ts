export type Command<I, O = void> = {
  execute(input: I): Promise<O>;
};

export type Query<I, O> = {
  execute(input: I): Promise<O>;
};
