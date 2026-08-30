describe('SecondsPipe', () => {
  it.each([
    [60, '1:00'],
    [90, '1:30'],
    [120, '2:00'],
  ])('converts fine', (seconds, result) => {
    const pipe = new SecondsPipe();
    expect(pipe.transform(seconds)).toBe(result);
  });
});
