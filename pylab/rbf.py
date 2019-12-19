#!/usr/bin/env python3
from mpl_toolkits import mplot3d
import numpy as np
import matplotlib.pyplot as plt

def gauss(x, c):
    return np.e**(-(np.linalg.norm(x-c)**2)/3)

def gausser(x, y, c, n):
    r = np.ndarray((n,n))
    for i in range(0,n):
        for j in range(0,n):
            r[i,j] = np.sqrt((x[i,j] - c[0])**2 + (y[i,j] - c[1])**2)
            r[i,j] = np.e**(-(r[i,j]**2)/3)
    return r


def main():

    n = 20
    res = 100
    
    xy = np.random.rand(n,2)*10
    f = np.random.rand(n)

    Phi = np.ndarray((n, n))
    for i in range(0, n):
        for j in range(0, n):
            Phi[i,j] = gauss(xy[j], xy[i])

    l = np.linalg.solve(Phi, f)
    xx = np.linspace(0, np.max(xy), res)
    yy = np.linspace(0, np.max(xy), res)
    XX, YY = np.meshgrid(xx, yy)
    s = np.ndarray((len(xx), len(xx)), dtype=np.float64)
    c = np.array([0.0, 0.0], dtype=np.float64)
    for i in range(0,n):
        s += l[i] * gausser(XX, YY , xy[i], res)

    ax = plt.axes(projection='3d')
    ax.plot_surface(XX, YY, s,
                            cmap='viridis', edgecolor='none');
    ax.scatter(xy.flatten()[::2], xy.flatten()[1::2], f, c=f)
    plt.show()

if __name__ == "__main__":
    main()
