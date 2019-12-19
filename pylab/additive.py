#!/usr/bin/env python3
import numpy as np

def main():

    x = np.linspace(0,1)

    y = np.sin(2*np.pi*x)
   
    f = np.fft.fft(y)
    print(f)


if __name__ == "__main__":
    main()
