export default function find_distance_d(x0, y0, x1, y1, d) {
  let points_dist = Math.sqrt( (x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1) )
  let delta_x = (y1 - y0) * d / points_dist
  let delta_y = (x1 - x0) * d / points_dist

  let a0_positive, b0_positive
  a0_positive = x0 - delta_x
  b0_positive = y0 + delta_y
  let x_1_3_positive, y_1_3_positive, x_2_3_positive, y_2_3_positive
  x_1_3_positive = a0_positive + (x1 - x0) / 3
  y_1_3_positive = b0_positive + (y1 - y0) / 3
  x_2_3_positive = a0_positive + (x1 - x0) * 2 / 3
  y_2_3_positive = b0_positive + (y1 - y0) * 2 / 3

  let a0_negative, b0_negative
  a0_negative = x0 + delta_x
  b0_negative = y0 - delta_y
  let x_1_3_negative, y_1_3_negative, x_2_3_negative, y_2_3_negative
  x_1_3_negative = a0_negative + (x1 - x0) / 3
  y_1_3_negative = b0_negative + (y1 - y0) / 3
  x_2_3_negative = a0_negative + (x1 - x0) * 2 / 3
  y_2_3_negative = b0_negative + (y1 - y0) * 2 / 3

  return {
    'x_1_3_positive': x_1_3_positive,
    'y_1_3_positive': y_1_3_positive,
    'x_2_3_positive': x_2_3_positive,
    'y_2_3_positive': y_2_3_positive,
    'x_1_3_negative': x_1_3_negative,
    'y_1_3_negative': y_1_3_negative,
    'x_2_3_negative': x_2_3_negative,
    'y_2_3_negative': y_2_3_negative
  }
}
