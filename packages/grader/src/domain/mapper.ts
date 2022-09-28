export type Mapper<E, M> = {
  from(model: M): E;
  to(entity: E): M;
};
